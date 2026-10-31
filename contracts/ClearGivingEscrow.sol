// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ClearGivingEscrow
 * @dev Transparent Milestone Charity Escrow with Anti-Collusion Multi-Auditor Voting,
 *      80/20 Challenge Retention Windows, and Pro-Rata Donor Refunds.
 *      Deployed on Polygon Amoy Testnet (Chain ID 80002).
 */
contract ClearGivingEscrow {
    address public immutable platformAdmin;
    uint256 public constant CHALLENGE_WINDOW = 48 hours;
    uint256 public constant LARGE_STAGE_THRESHOLD = 100000 ether; // Scaled for demo in wei/rupee-equivalent

    enum MilestoneStatus {
        Locked,
        AwaitingProof,
        UnderReview,
        ApprovedInChallenge,
        Released,
        Rejected,
        Disputed
    }

    struct Auditor {
        address wallet;
        string pseudonym; // e.g. "Auditor #A1"
        string specialty;
        bool isActive;
        bool isCanaryFlagged;
        uint256 approvalCount;
        uint256 totalVotes;
    }

    struct Milestone {
        uint256 id;
        string title;
        uint256 targetAmount;
        uint256 panelSize; // 3 or 5
        uint256 requiredApprovals; // 2 or 3
        uint256 immediatePayout; // 80%
        uint256 retainedAmount; // 20%
        uint256 challengeEndsAt;
        MilestoneStatus status;
        uint256 approveVotes;
        uint256 rejectVotes;
        bool isDisputed;
        string evidenceIpfsCid;
    }

    struct Campaign {
        uint256 id;
        address payable ngoWallet;
        string title;
        uint256 goalAmount;
        uint256 raisedAmount;
        uint256 heldAmount;
        uint256 releasedAmount;
        uint256 deadline;
        bool planApproved;
        uint256 currentMilestoneIndex;
        uint256 milestoneCount;
    }

    // Storage
    uint256 public campaignCounter;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(uint256 => Milestone)) public campaignMilestones;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public donorContributions;

    // Auditor pool (7 auditors)
    address[] public auditorList;
    mapping(address => Auditor) public auditors;

    // Events
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event PlanApproved(uint256 indexed campaignId);
    event ProofSubmitted(uint256 indexed campaignId, uint256 indexed milestoneId, string cid);
    event VoteCast(uint256 indexed campaignId, uint256 indexed milestoneId, address indexed auditor, bool approved);
    event StageApproved(uint256 indexed campaignId, uint256 indexed milestoneId, uint256 immediatePayout, uint256 retainedAmount);
    event RetentionReleased(uint256 indexed campaignId, uint256 indexed milestoneId, uint256 amount);
    event DisputeFiled(uint256 indexed campaignId, uint256 indexed milestoneId, address indexed disputer, string reason);
    event RefundClaimed(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event CanaryTrapTriggered(address indexed auditor, uint256 indexed campaignId);

    modifier onlyAdmin() {
        require(msg.sender == platformAdmin, "Only admin");
        _;
    }

    modifier onlyAuditor() {
        require(auditors[msg.sender].isActive, "Only registered auditor");
        require(!auditors[msg.sender].isCanaryFlagged, "Auditor is suspended");
        _;
    }

    constructor() {
        platformAdmin = msg.sender;
    }

    // 1. Auditor Registration
    function registerAuditor(
        address _wallet,
        string calldata _pseudonym,
        string calldata _specialty
    ) external onlyAdmin {
        require(_wallet != address(0), "Invalid address");
        if (!auditors[_wallet].isActive && auditors[_wallet].wallet == address(0)) {
            auditorList.push(_wallet);
        }
        auditors[_wallet] = Auditor({
            wallet: _wallet,
            pseudonym: _pseudonym,
            specialty: _specialty,
            isActive: true,
            isCanaryFlagged: false,
            approvalCount: 0,
            totalVotes: 0
        });
    }

    // 2. Campaign Creation
    function createCampaign(
        address payable _ngoWallet,
        string calldata _title,
        uint256 _goalAmount,
        uint256 _deadline
    ) external returns (uint256) {
        require(_ngoWallet != address(0), "Invalid NGO wallet");
        require(_goalAmount > 0, "Invalid goal");
        require(_deadline > block.timestamp, "Deadline must be future");

        campaignCounter++;
        uint256 campId = campaignCounter;

        campaigns[campId] = Campaign({
            id: campId,
            ngoWallet: _ngoWallet,
            title: _title,
            goalAmount: _goalAmount,
            raisedAmount: 0,
            heldAmount: 0,
            releasedAmount: 0,
            deadline: _deadline,
            planApproved: false,
            currentMilestoneIndex: 0,
            milestoneCount: 0
        });

        return campId;
    }

    function addMilestone(
        uint256 _campaignId,
        string calldata _title,
        uint256 _targetAmount
    ) external {
        Campaign storage camp = campaigns[_campaignId];
        require(msg.sender == camp.ngoWallet || msg.sender == platformAdmin, "Unauthorized");
        require(!camp.planApproved, "Plan already approved");

        uint256 msIdx = camp.milestoneCount;
        uint256 panelSize = _targetAmount >= LARGE_STAGE_THRESHOLD ? 5 : 3;
        uint256 reqApprovals = _targetAmount >= LARGE_STAGE_THRESHOLD ? 3 : 2;

        campaignMilestones[_campaignId][msIdx] = Milestone({
            id: msIdx,
            title: _title,
            targetAmount: _targetAmount,
            panelSize: panelSize,
            requiredApprovals: reqApprovals,
            immediatePayout: (_targetAmount * 80) / 100,
            retainedAmount: (_targetAmount * 20) / 100,
            challengeEndsAt: 0,
            status: msIdx == 0 ? MilestoneStatus.AwaitingProof : MilestoneStatus.Locked,
            approveVotes: 0,
            rejectVotes: 0,
            isDisputed: false,
            evidenceIpfsCid: ""
        });

        camp.milestoneCount++;
    }

    function approvePlan(uint256 _campaignId) external onlyAdmin {
        campaigns[_campaignId].planApproved = true;
        emit PlanApproved(_campaignId);
    }

    // 3. Donor Contribution to Escrow
    function donate(uint256 _campaignId) external payable {
        Campaign storage camp = campaigns[_campaignId];
        require(camp.id != 0, "Campaign not found");
        require(camp.planApproved, "Plan not yet approved by auditors");
        require(block.timestamp < camp.deadline, "Campaign ended");
        require(msg.value > 0, "Donation must be > 0");

        camp.raisedAmount += msg.value;
        camp.heldAmount += msg.value;
        donorContributions[_campaignId][msg.sender] += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    // 4. Submit Proof
    function submitProof(
        uint256 _campaignId,
        uint256 _milestoneId,
        string calldata _cid
    ) external {
        Campaign storage camp = campaigns[_campaignId];
        require(msg.sender == camp.ngoWallet, "Only NGO can submit proof");
        Milestone storage ms = campaignMilestones[_campaignId][_milestoneId];
        require(ms.status == MilestoneStatus.AwaitingProof || ms.status == MilestoneStatus.Rejected, "Invalid status");

        ms.evidenceIpfsCid = _cid;
        ms.status = MilestoneStatus.UnderReview;

        emit ProofSubmitted(_campaignId, _milestoneId, _cid);
    }

    // 5. Blind Voting & 80/20 Retention Release
    function castVote(
        uint256 _campaignId,
        uint256 _milestoneId,
        bool _approve,
        bool _isKnownCanary
    ) external onlyAuditor {
        Milestone storage ms = campaignMilestones[_campaignId][_milestoneId];
        require(ms.status == MilestoneStatus.UnderReview, "Not under review");
        require(!hasVoted[_campaignId][_milestoneId][msg.sender], "Already voted");

        hasVoted[_campaignId][_milestoneId][msg.sender] = true;
        auditors[msg.sender].totalVotes++;

        // Anti-Collusion Canary Trap Check
        if (_isKnownCanary && _approve) {
            auditors[msg.sender].isCanaryFlagged = true;
            auditors[msg.sender].isActive = false;
            emit CanaryTrapTriggered(msg.sender, _campaignId);
            return;
        }

        if (_approve) {
            ms.approveVotes++;
            auditors[msg.sender].approvalCount++;
        } else {
            ms.rejectVotes++;
        }

        emit VoteCast(_campaignId, _milestoneId, msg.sender, _approve);

        // Check if approval threshold reached
        if (ms.approveVotes >= ms.requiredApprovals) {
            ms.status = MilestoneStatus.ApprovedInChallenge;
            ms.challengeEndsAt = block.timestamp + CHALLENGE_WINDOW;

            // 80% immediate release to NGO
            Campaign storage camp = campaigns[_campaignId];
            uint256 payout = ms.immediatePayout;
            if (payout > camp.heldAmount) payout = camp.heldAmount;

            camp.heldAmount -= ms.targetAmount;
            camp.releasedAmount += payout;

            (bool sent, ) = camp.ngoWallet.call{value: payout}("");
            require(sent, "Payout transfer failed");

            emit StageApproved(_campaignId, _milestoneId, payout, ms.retainedAmount);
        } else if (ms.rejectVotes > (ms.panelSize - ms.requiredApprovals)) {
            ms.status = MilestoneStatus.Rejected;
        }
    }

    // 6. Release Retained 20% after 48-Hour Challenge Window
    function releaseRetention(uint256 _campaignId, uint256 _milestoneId) external {
        Milestone storage ms = campaignMilestones[_campaignId][_milestoneId];
        require(ms.status == MilestoneStatus.ApprovedInChallenge, "Not in challenge window");
        require(block.timestamp >= ms.challengeEndsAt, "Challenge window not ended");
        require(!ms.isDisputed, "Milestone is currently disputed");

        ms.status = MilestoneStatus.Released;
        uint256 retained = ms.retainedAmount;

        Campaign storage camp = campaigns[_campaignId];
        camp.releasedAmount += retained;

        // Unlock next sequential milestone
        uint256 nextMsId = _milestoneId + 1;
        if (nextMsId < camp.milestoneCount) {
            campaignMilestones[_campaignId][nextMsId].status = MilestoneStatus.AwaitingProof;
            camp.currentMilestoneIndex = nextMsId;
        }

        (bool sent, ) = camp.ngoWallet.call{value: retained}("");
        require(sent, "Retention payout failed");

        emit RetentionReleased(_campaignId, _milestoneId, retained);
    }

    // 7. Public Dispute Challenge
    function fileDispute(
        uint256 _campaignId,
        uint256 _milestoneId,
        string calldata _reason
    ) external {
        Milestone storage ms = campaignMilestones[_campaignId][_milestoneId];
        require(ms.status == MilestoneStatus.ApprovedInChallenge, "Can only dispute within challenge window");
        require(block.timestamp < ms.challengeEndsAt, "Challenge window expired");

        ms.isDisputed = true;
        ms.status = MilestoneStatus.Disputed;

        emit DisputeFiled(_campaignId, _milestoneId, msg.sender, _reason);
    }

    // 8. Pro-Rata Donor Refund If Stalled
    function claimRefund(uint256 _campaignId) external {
        Campaign storage camp = campaigns[_campaignId];
        require(block.timestamp > camp.deadline, "Deadline has not passed");
        Milestone storage currentMs = campaignMilestones[_campaignId][camp.currentMilestoneIndex];
        require(currentMs.status != MilestoneStatus.Released, "Current milestone completed");

        uint256 contributed = donorContributions[_campaignId][msg.sender];
        require(contributed > 0, "No contribution recorded");

        // Calculate pro-rata unspent share
        uint256 refundAmount = (contributed * camp.heldAmount) / camp.raisedAmount;
        require(refundAmount > 0, "No refundable escrow balance");

        donorContributions[_campaignId][msg.sender] = 0;
        camp.heldAmount -= refundAmount;

        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund transfer failed");

        emit RefundClaimed(_campaignId, msg.sender, refundAmount);
    }

    function getAuditorsCount() external view returns (uint256) {
        return auditorList.length;
    }
}
