// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title D8FiStaking
 * @notice Users stake tokens before setting up a date. Stakes are released
 *         upon successful check-in or mutual cancellation.
 * @dev Owner can act as an arbiter or integrate with off-chain agent verification.
 */
contract D8Staking is Ownable, ReentrancyGuard {
    IERC20 public immutable token;

    struct StakeInfo {
        address userA;
        address userB;
        uint256 amount;
        bool userAConfirmed;
        bool userBConfirmed;
        bool active;
    }

    // Unique date ID counter
    uint256 private _dateCounter;

    // Mapping dateId => StakeInfo
    mapping(uint256 => StakeInfo) public stakes;

    event DateCreated(uint256 indexed dateId, address indexed userA, address indexed userB, uint256 amount);
    event CheckInVerified(uint256 indexed dateId);
    event DateCancelled(uint256 indexed dateId);
    event StakeReleased(uint256 indexed dateId, address to, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token");
        token = IERC20(_token);
    }

    /**
     * @notice User initiates a date and stakes tokens.
     * @param partner The other user in the date.
     * @param amount The stake amount in tokens.
     * @return dateId Unique ID of the created date.
     */
    function createDate(address partner, uint256 amount) external nonReentrant returns (uint256 dateId) {
        require(partner != address(0) && partner != msg.sender, "Invalid partner");
        require(amount > 0, "Invalid stake amount");

        // Transfer stake from initiator
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        _dateCounter++;
        dateId = _dateCounter;

        stakes[dateId] = StakeInfo({
            userA: msg.sender,
            userB: partner,
            amount: amount,
            userAConfirmed: true,
            userBConfirmed: false,
            active: true
        });

        emit DateCreated(dateId, msg.sender, partner, amount);
    }

    /**
     * @notice Partner confirms participation by staking the same amount.
     * @param dateId The ID of the date to confirm.
     */
    function confirmDate(uint256 dateId) external nonReentrant {
        StakeInfo storage info = stakes[dateId];
        require(info.active, "Date not active");
        require(msg.sender == info.userB, "Not partner");
        require(!info.userBConfirmed, "Already confirmed");

        require(token.transferFrom(msg.sender, address(this), info.amount), "Token transfer failed");

        info.userBConfirmed = true;
    }

    /**
     * @notice Called by owner (backend oracle/agent) to verify successful check-in.
     *         Releases both users' stakes.
     */
    function verifyCheckIn(uint256 dateId) external onlyOwner nonReentrant {
        StakeInfo storage info = stakes[dateId];
        require(info.active, "Date not active");
        require(info.userAConfirmed && info.userBConfirmed, "Both not confirmed");

        info.active = false;

        uint256 total = info.amount * 2;
        require(token.transfer(info.userA, info.amount), "Transfer A failed");
        require(token.transfer(info.userB, info.amount), "Transfer B failed");

        emit CheckInVerified(dateId);
        emit StakeReleased(dateId, info.userA, info.amount);
        emit StakeReleased(dateId, info.userB, info.amount);
    }

    /**
     * @notice Both users can mutually agree to cancel and release their stakes.
     * @param dateId The date to cancel.
     */
    function mutualCancel(uint256 dateId) external nonReentrant {
        StakeInfo storage info = stakes[dateId];
        require(info.active, "Date not active");
        require(msg.sender == info.userA || msg.sender == info.userB, "Not a participant");

        // Track mutual consent
        if (msg.sender == info.userA) {
            require(!info.userAConfirmed || info.userAConfirmed, "Already marked"); // keep symmetrical
            info.userAConfirmed = false;
        } else {
            require(!info.userBConfirmed || info.userBConfirmed, "Already marked");
            info.userBConfirmed = false;
        }

        // If both canceled, release stakes
        if (!info.userAConfirmed && !info.userBConfirmed) {
            info.active = false;
            uint256 refund = info.amount;

            require(token.transfer(info.userA, refund), "Refund A failed");
            require(token.transfer(info.userB, refund), "Refund B failed");

            emit DateCancelled(dateId);
            emit StakeReleased(dateId, info.userA, refund);
            emit StakeReleased(dateId, info.userB, refund);
        }
    }

    /**
     * @notice Emergency function (failsafe) to withdraw stuck tokens, onlyOwner.
     */
    function rescueTokens(address token, uint256 amount, address to) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }

    function getNextDateId() external view returns (uint256) {
        return _dateCounter + 1;
    }
}
