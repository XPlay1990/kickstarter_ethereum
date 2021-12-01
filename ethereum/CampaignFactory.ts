import web3 from './web3'
import CampaignFactory from './contracts/build/KickstarterCampaignFactory.json'
import {CAMPAIGN_FACTORY_ADDRESS} from '../secretConfig'
import {AbiItem} from "web3-utils";

const instance = new web3.eth.Contract(
    CampaignFactory.abi as AbiItem[],
    CAMPAIGN_FACTORY_ADDRESS
)

export default instance