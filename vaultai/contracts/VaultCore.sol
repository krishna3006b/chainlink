// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

interface ICCIPRouter {
    function receiveMessage(string calldata data) external;
}

interface IAIRiskManager {
    function getRiskScore(address user) external view returns (uint8);
}

contract VaultCore is AutomationCompatibleInterface, VRFConsumerBaseV2 {
    AggregatorV3Interface internal priceFeed;
    IAIRiskManager public riskManager;
    address public ccipRouter;

    // Chainlink VRF
    VRFCoordinatorV2Interface COORDINATOR;
    bytes32 public keyHash;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit = 100000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;

    // Loan structure
    struct Loan {
        address borrower;
        uint256 amount;
        bool repaid;
        uint8 riskTier;
    }

    mapping(uint256 => Loan) public loans;
    uint256 public loanId;

    // Events
    event LoanIssued(address borrower, uint256 amount, uint256 loanId, uint8 riskTier);
    event LoanLiquidated(uint256 loanId);
    event CrossChainLoanApproval(uint256 assetId, uint256 amount, address borrower);
    event RandomLoanSelected(uint256 selectedLoanId);

    constructor(
        address _priceFeed,
        address _riskManager,
        address _ccipRouter,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        priceFeed = AggregatorV3Interface(_priceFeed);
        riskManager = IAIRiskManager(_riskManager);
        ccipRouter = _ccipRouter;

        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
    }

    // ---- Core Loan Logic ----

    function borrow(uint256 amount) internal {
        uint8 riskTier = riskManager.getRiskScore(msg.sender);
        require(riskTier >= 2, "Risk too high"); // B or A only
        loans[loanId] = Loan(msg.sender, amount, false, riskTier);
        emit LoanIssued(msg.sender, amount, loanId, riskTier);
        loanId++;
    }

    function receiveLoanApproval(uint256 assetId, uint256 amount) external {
        uint8 riskTier = riskManager.getRiskScore(msg.sender);
        require(riskTier >= 2, "Risk too high (approval)");
        borrow(amount);
        emit CrossChainLoanApproval(assetId, amount, msg.sender);
    }

    function receiveCrossChainMessage(string calldata data) external {
        require(msg.sender == ccipRouter, "Only CCIPRouter");
        // Handle CCIP message if needed
    }

    // ---- Health Check ----

    function checkHealth() external view returns (bool) {
        return true; // Placeholder for external price-based logic
    }

    function getLatestETHPrice() public view returns (int) {
        (, int price,,,) = priceFeed.latestRoundData();
        return price;
    }

    // ---- Chainlink Automation ----

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 0; i < loanId; i++) {
            if (!loans[i].repaid && _isUnhealthy(loans[i])) {
                return (true, abi.encode(i));
            }
        }
        return (false, "");
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256 badLoanId = abi.decode(performData, (uint256));
        liquidateLoan(badLoanId);
    }

    function _isUnhealthy(Loan memory loan) internal view returns (bool) {
        return loan.amount > 1 ether;
    }

    function liquidateLoan(uint256 _loanId) public {
        require(!loans[_loanId].repaid, "Already repaid");
        loans[_loanId].repaid = true;
        emit LoanLiquidated(_loanId);
    }

    // ---- Chainlink VRF Audit ----

    function requestAudit() external {
        require(loanId > 0, "No loans exist");
        COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
        uint256 selected = randomWords[0] % loanId;
        emit RandomLoanSelected(selected);
        // Optional: auditLoan(selected); here
    }
}
