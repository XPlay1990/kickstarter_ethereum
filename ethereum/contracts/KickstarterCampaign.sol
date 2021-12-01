// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract KickstarterCampaign {
    address public contractManager;
    uint  public minimumContribution;
    mapping(address => uint) public funders;
    uint public fundersCount;
    //    CampaignRequest[] public campaignRequests;
    uint public numRequests;
    mapping(uint => CampaignRequest) public campaignRequests;


    constructor(uint minContribution, address creator){
        contractManager = creator;
        minimumContribution = minContribution;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);

        funders[msg.sender] += msg.value;
        fundersCount++;
    }

    function createManagerRequest(string memory description, uint payoutValue, address recipient) public restricted returns (uint requestID){
        requestID = numRequests++;
        CampaignRequest storage currentCampaign = campaignRequests[requestID];
        currentCampaign.recipient = payable(recipient);
        currentCampaign.payoutValue = payoutValue;
        currentCampaign.description = description;
        currentCampaign.approvalCount = 0;
        currentCampaign.complete = false;
    }

    function finalizeManagerRequest(uint campaignID) public restricted {
        CampaignRequest storage currentRequest = campaignRequests[campaignID];

        require(!currentRequest.complete);
        require(currentRequest.approvalCount > (fundersCount / 2));

        currentRequest.recipient.transfer(currentRequest.payoutValue);
        currentRequest.complete = true;
    }

    function voteForRequest(uint campaignID) public {
        //check that sender is funder
        require(funders[msg.sender] > 0);

        CampaignRequest storage currentRequest = campaignRequests[campaignID];

        //check that sender has not voted for this request before
        require(!(currentRequest.approvalsMapping[msg.sender]));

        currentRequest.approvalsMapping[msg.sender] = true;
        currentRequest.approvalCount++;
    }

    function getSummary() public view returns (uint, uint, uint, uint, address) {
        return (
            minimumContribution,
            address(this).balance,
            numRequests,
            fundersCount,
            contractManager
        );
    }

    function getRequestsCount() public view returns (uint) {
        return numRequests;
    }

    modifier restricted() {
        require(msg.sender == contractManager);
        _;
    }

    struct CampaignRequest {
        string description;
        uint payoutValue;
        address payable recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvalsMapping;
    }
}
