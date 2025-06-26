// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

interface ICCIPRouter {
    function receiveMessage(string calldata data) external;
}

interface IAIRiskManager {
    function getRiskScore(address user) external view returns (uint8);
}

contract VaultCore is AutomationCompatibleInterface {
    AggregatorV3Interface internal ethPriceFeed;
    AggregatorV3Interface internal usdcPriceFeed;
    IAIRiskManager public riskManager;
    address public ccipRouter;

    constructor(address _ethPriceFeed, address _usdcPriceFeed, address _riskManager, address _ccipRouter) {
        ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);
        usdcPriceFeed = AggregatorV3Interface(_usdcPriceFeed);
        riskManager = IAIRiskManager(_riskManager);
        ccipRouter = _ccipRouter;
    }

    struct Loan {
        address borrower;
        uint256 amount;
        bool repaid;
        uint8 riskTier;
        address asset; // ETH or USDC
    }

    mapping(uint256 => Loan) public loans;
    uint256 public loanId;

    event LoanIssued(address borrower, uint256 amount, uint256 loanId, uint8 riskTier, address asset);
    event LoanLiquidated(uint256 loanId);
    event CrossChainLoanApproval(uint256 assetId, uint256 amount, address borrower);

    function borrow(uint256 amount, address asset) internal {
        uint8 riskTier = riskManager.getRiskScore(msg.sender);
        require(riskTier >= 2, "Risk too high");
        loans[loanId] = Loan(msg.sender, amount, false, riskTier, asset);
        emit LoanIssued(msg.sender, amount, loanId, riskTier, asset);
        loanId++;
    }

    function receiveLoanApproval(uint256 assetId, uint256 amount, address asset) external {
        borrow(amount, asset);
        emit CrossChainLoanApproval(assetId, amount, msg.sender);
    }

    function receiveCrossChainMessage(string calldata data) external {
        require(msg.sender == ccipRouter, "Only CCIPRouter");
        // Parse and handle cross-chain loan approval (mock)
    }

    function checkHealth() external view returns (bool) {
        return true;
    }

    function getLatestETHPrice() public view returns (int) {
        (, int price,,,) = ethPriceFeed.latestRoundData();
        return price;
    }

    function getLatestUSDCPrice() public view returns (int) {
        (, int price,,,) = usdcPriceFeed.latestRoundData();
        return price;
    }

    // --- Chainlink Automation ---
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
        // Example: unhealthy if amount > 1 ether for ETH, or > 1000 USDC for USDC
        if (loan.asset == address(0)) {
            return loan.amount > 1 ether;
        } else {
            return loan.amount > 1000 * 1e6;
        }
    }

    function liquidateLoan(uint256 _loanId) public {
        require(!loans[_loanId].repaid, "Already repaid");
        loans[_loanId].repaid = true;
        emit LoanLiquidated(_loanId);
    }
}
