const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')

const web3 = new Web3(ganache.provider())

const compiledFactory = require("../ethereum/contracts/build/KickstarterCampaignFactory.json")
const compiledCampaign = require("../ethereum/contracts/build/KickstarterCampaign.json")

let accounts
let factory
let campaignAddress
let campaign

beforeEach(async () => {
    accounts = await web3.eth.getAccounts()
    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({data: compiledFactory.evm.bytecode.object})
        // .estimateGas({from: accounts[0]});
        .send({from: accounts[0], gas: 2000000})

    await factory.methods.createCampaign(100)
        .send({from: accounts[0], gas: 2000000})

    const addresses = await factory.methods.getDeployedCampaigns().call()
    campaignAddress = addresses[0]

    campaign = await new web3.eth.Contract(
        compiledCampaign.abi,
        campaignAddress
    )
})

describe("Campaigns", () => {
    it("deploys factory and one campaign", () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    })

    it("caller is campaign-manager", async () => {
        const managerAddress = await campaign.methods.contractManager().call()
        assert.strictEqual(managerAddress, accounts[0])
    })

    it("allows contributors/funders", async () => {
        await campaign.methods.contribute()
            .send({from: accounts[1], value: 200})

        const isContributor = await campaign.methods.funders(accounts[1]).call()
        assert(isContributor)
    })

    it("required minimum contribution", async () => {
        try {
            await campaign.methods.contribute()
                .send({from: accounts[1], value: 99})
            assert(false)
        } catch (err) {
            assert(err)
        }
    })

    it("allows manager to create a request", async () => {
        await campaign.methods.createManagerRequest('Buy materials', 100, accounts[1])
            .send({from: accounts[0], gas: 2000000})
        const request = await campaign.methods.campaignRequests(0).call()
        assert.strictEqual('Buy materials', request.description)
    })

    it("full request", async () => {
        let balanceBefore = await web3.eth.getBalance(accounts[1])
        balanceBefore = web3.utils.fromWei(balanceBefore, "ether")
        balanceBefore = parseFloat(balanceBefore)

        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei("10", "ether")
        })

        await campaign.methods.createManagerRequest('Buy materials', web3.utils.toWei("5", "ether"), accounts[1]).send({
            from: accounts[0],
            gas: 2000000
        })

        await campaign.methods.voteForRequest(0).send({
            from: accounts[0],
            gas: 2000000
        })

        await campaign.methods.finalizeManagerRequest(0).send({
            from: accounts[0],
            gas: 2000000
        })

        let balanceAfter = await web3.eth.getBalance(accounts[1])
        balanceAfter = web3.utils.fromWei(balanceAfter, "ether")
        balanceAfter = parseFloat(balanceAfter)

        assert(balanceAfter > balanceBefore + 4)
    })


})