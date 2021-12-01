import React, {useState} from "react"
import Layout from "../../components/Layout";
import {Alert, Button, IconButton, InputAdornment, Slide, Snackbar, TextField, Typography} from "@mui/material";
import campaignFactory from "../../ethereum/CampaignFactory";
import web3 from "../../ethereum/web3";
import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '@mui/lab/LoadingButton';
import {useRouter} from "next/router";

function NewCampaign() {
    const router = useRouter()

    const [minimumContribution, setMinimumContribution] = useState("0")
    const [isLoading, setIsLoading] = useState(false)
    const [isErrorMessageOpen, setIsErrorMessageOpen] = useState(false)
    const [errorState, setErrorState] = React.useState({
        vertical: 'top' as any,
        horizontal: 'right' as any,
        errorMessage: ""
    });
    const {vertical, horizontal, errorMessage} = errorState;

    function handleClose() {
        setIsErrorMessageOpen(false)
    }

    async function onSubmit(event) {
        event.preventDefault()
        setIsLoading(true)
        try {
            const accounts = await web3.eth.getAccounts()
            await campaignFactory.methods.createCampaign(minimumContribution).send({
                from: accounts[0]
            })
            await router.push('/')
        } catch (err) {
            errorState.errorMessage = "An Error occurred during transaction: " + JSON.stringify(err)
            setErrorState(errorState)
            setIsErrorMessageOpen(true)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Layout>
            <form onSubmit={onSubmit} style={{display: "flex", flexDirection: "column", width: "50%", margin: "auto"}}>
                <Typography variant={"h2"}>New Campaign</Typography>

                <TextField inputMode={"decimal"} label={"Minimum Contribution"} required
                           InputProps={{
                               endAdornment: (
                                   <InputAdornment position="end">
                                       <Typography>wei</Typography>
                                   </InputAdornment>
                               ),
                           }}
                           value={minimumContribution}
                           onChange={event => setMinimumContribution(event.target.value)}
                />
                <LoadingButton loading={isLoading} type={"submit"} variant={"contained"}
                               style={{maxWidth: "300px", margin: "5px"}}>
                    Create
                </LoadingButton>
            </form>

            <Snackbar
                open={isErrorMessageOpen}
                autoHideDuration={6000}
                key={"top right"}
                anchorOrigin={{vertical, horizontal}}
                TransitionComponent={Slide}
            >
                <Alert severity="error" action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                            handleClose()
                        }}
                    >
                        <CloseIcon fontSize="inherit"/>
                    </IconButton>
                }>{errorState.errorMessage}</Alert>
            </Snackbar>
        </Layout>
    )
}

export default NewCampaign