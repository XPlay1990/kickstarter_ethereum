import web3 from './web3'
import Campaign from './contracts/build/KickstarterCampaign.json'
import {AbiItem} from "web3-utils";

export default (address) => {
    return new web3.eth.Contract(
        Campaign.abi as AbiItem[],
        address
    )
}
