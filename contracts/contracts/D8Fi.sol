// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import OpenZeppelin ERC20 standard and access control
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TrueD8 Token (D8Fi)
 * @dev ERC20 token with capped total supply, mint, and burn capabilities.
 */
contract TrueD8 is ERC20, Ownable {
    // Maximum supply: 1 billion tokens (1,000,000,000 * 10^decimals)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    constructor() ERC20("TrueD8", "D8Fi") Ownable(msg.sender) {}

    /**
     * @dev Mint new tokens, only owner can call this.
     * Reverts if minting exceeds MAX_SUPPLY.
     * @param to The address to receive newly minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "TrueD8: exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance.
     * @param amount The amount of tokens to burn.
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Owner can burn tokens from any address (if needed for admin control).
     * @param account Address to burn tokens from.
     * @param amount Amount to burn.
     */
    function burnFrom(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }
}
