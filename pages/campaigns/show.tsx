import React, {useEffect, useState} from "react"
import {useRouter} from "next/router";
import Layout from "../../components/Layout";
import Campaign from "../../ethereum/Campaign";
import campaign from "../../ethereum/Campaign";
import {CardContent, CardHeader, Grid, InputAdornment, TextField, Typography} from "@mui/material";
import Card from "@mui/material/Card";
import web3 from "../../ethereum/web3";
import {Box} from "@mui/system";
import LoadingButton from "@mui/lab/LoadingButton";

function Show() {
    const router = useRouter()
    const [campaignSummary, setCampaignSummary] = useState(null)
    const [campaignRequests, setCampaignRequests] = useState([] as any[])

    const [fundingValue, setFundingValue] = useState("0")
    const [isLoading, setIsLoading] = useState(false)
    const [isErrorMessageOpen, setIsErrorMessageOpen] = useState(false)
    const [errorState, setErrorState] = React.useState({
        vertical: 'top' as any,
        horizontal: 'right' as any,
        errorMessage: ""
    });
    useEffect(() => {
        async function getCampaignSummary(campaign) {
            return await campaign.methods.getSummary().call()
        }

        async function getAllRequests(campaign) {
            const requestCount = await campaign.methods.getRequestsCount().call();

            return await Promise.all(
                Array(parseInt(requestCount))
                    .fill(0)
                    .map((element, index) => {
                        return campaign.methods.campaignRequests(index).call();
                    })
            );
        }

        const routeSplit = router.asPath.split('/');
        const address = routeSplit[routeSplit.length - 1];
        const campaign = Campaign(address)

        getCampaignSummary(campaign).then(summary => {
            setCampaignSummary({
                address: campaign.options.address,
                minimumContribution: summary[0],
                balance: summary[1],
                requestsCount: summary[2],
                fundersCount: summary[3],
                manager: summary[4],
            })
        })

        getAllRequests(campaign).then(requests => setCampaignRequests(requests))
    }, [])

    function renderRequestSummary() {
        if (!campaignSummary) {
            return null
        }

        const items = [
            {
                header: campaignSummary.address,
                meta: "Contract address of this Campaign",
                description: "The address of the contract on the Ethereum network."
            },
            {
                header: campaignSummary.manager,
                meta: "Address of the manager",
                description: "The manager that created this campaign. Can create Requests and finalize them if enough funders approved."
            },
            {
                header: campaignSummary.minimumContribution,
                meta: "Minimum contribution (wei)",
                description: "Minimum contribution to become a funder for this campaign"
            },
            {
                header: campaignSummary.requestsCount,
                meta: "Number of requests",
                description: "A request is created by the manager to withdraw money from the contract. Has to be approved by more than 50% of the funders to be able to be paid out."
            },
            {
                header: campaignSummary.fundersCount,
                meta: "Number of funders",
                description: "Number of addresses that are funders of this campaign. To become a funder you have to contribute at least the minimum contribution amount to the contract."
            },
            {
                header: web3.utils.fromWei(campaignSummary.balance, "ether"),
                meta: "Current balance (ether) of the Contract",
                description: "Balance of how much ether is locked inside the contract right now."
            }
        ]

        return items.map(item => {
            return (
                <Grid item xs={6} key={item.header}>
                    <Card key={item.header} style={{height: "100%"}}>
                        <CardHeader
                            title={
                                <Typography noWrap fontWeight={"bold"}>
                                    {item.header}
                                </Typography>
                            }
                            subheader={
                                <Typography>
                                    {item.meta}
                                </Typography>
                            }
                        />
                        <CardContent>
                            <Typography>
                                {item.description}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            )
        })
    }

    function renderRequests() {
        console.log(campaignRequests)
        const items = campaignRequests.map((campaignRequest, index) => {
            return {
                requestIndex: index,
                description: campaignRequest.description,
                payoutValue: web3.utils.fromWei(campaignRequest.payoutValue, "ether"),
                recipient: campaignRequest.recipient,
                approvalCount: campaignRequest.approvalCount,
                complete: campaignRequest.complete
            }
        })

        return items.map(item => {
            return (
                <Grid item xs={6} key={item.description}>
                    <Card key={item.requestIndex + ": " + item.description}>
                        <CardHeader
                            title={
                                <Typography noWrap>
                                    {item.requestIndex + ": " + item.description}
                                </Typography>
                            }
                            subheader={item.payoutValue + " ether"}
                        />
                        <CardContent>
                            <Typography>
                                Recipient: {item.recipient}
                            </Typography>
                            <Typography>
                                approvalCount: {item.approvalCount}
                            </Typography>
                            <Typography>
                                complete: {item.complete.toString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            )
        })
    }

    async function onSubmit(event) {
        event.preventDefault()
        setIsLoading(true)
        try {
            const accounts = await web3.eth.getAccounts()
            await campaign(campaignSummary.address).methods.contribute().send({
                from: accounts[0],
                value: web3.utils.toWei(fundingValue, "ether")
            })
            router.reload()
        } catch (err) {
            console.log(err)
            errorState.errorMessage = "An Error occurred during transaction: " + JSON.stringify(err)
            setErrorState(errorState)
            setIsErrorMessageOpen(true)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Layout>
            <Grid container spacing={2}>
                {renderRequestSummary()}
            </Grid>
            <Box display={"flex"} flexDirection={"column"}>
                <form onSubmit={onSubmit}
                      style={{display: "flex", flexDirection: "column", width: "50%", margin: "auto"}}>
                    <Typography variant={"h2"}>New Campaign</Typography>

                    <TextField inputMode={"decimal"} label={"Funding value"} required
                               InputProps={{
                                   endAdornment: (
                                       <InputAdornment position="end">
                                           <Typography>ether</Typography>
                                       </InputAdornment>
                                   ),
                               }}
                               value={fundingValue}
                               onChange={event => setFundingValue(event.target.value)}
                    />
                    <LoadingButton loading={isLoading} type={"submit"} variant={"contained"}
                                   style={{maxWidth: "300px", margin: "5px"}}>
                        Contribute
                    </LoadingButton>
                </form>
            </Box>
            <Grid container spacing={2}>
                {renderRequests()}
            </Grid>
        </Layout>
    )
}

export default Show