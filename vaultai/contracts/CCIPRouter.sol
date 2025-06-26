// contracts/CCIPRouter.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CCIPRouter {
    event MessageReceived(address from, string data);
    event MessageSent(address to, string data);

    function receiveMessage(string calldata data) external {
        emit MessageReceived(msg.sender, data);
        // In production, parse and route to VaultCore or other contracts
    }

    function sendMessage(address to, string calldata data) external {
        emit MessageSent(to, data);
        // In production, would trigger CCIP cross-chain send
    }
}
