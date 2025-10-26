// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TrueD8Profile.sol
 *
 * ERC721 profile NFTs for TrueD8
 * - IPFS metadata friendly (accepts tokenURI like "ipfs://Qm...")
 * - One-profile-per-address policy (configurable)
 * - Metadata locking per token (immutable once locked)
 * - Admin minting, user minting, burn, and safe tokenURI updates
 * - ERC2981 royalty support included (optional)
 *
 * Best practices:
 * - OpenZeppelin audited contracts
 * - Events for important state changes
 * - Enumerable extension for easier indexing
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract TrueD8Profile is ERC721, ERC721Enumerable, Ownable, ERC2981 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    /// tokenId => metadata URI (expected to be ipfs://... or https://....)
    mapping(uint256 => string) private _tokenURIs;

    /// tokenId => metadata locked
    mapping(uint256 => bool) public metadataLocked;

    /// address => tokenId (if onePerAddress enforced)
    mapping(address => uint256) private _ownerToToken;

    /// config: allow only one profile per address (default true)
    bool public oneProfilePerAddress = true;

    event ProfileMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event ProfileBurned(address indexed owner, uint256 indexed tokenId);
    event MetadataUpdated(uint256 indexed tokenId, string tokenURI);
    event MetadataLocked(uint256 indexed tokenId);
    event OneProfilePerAddressToggled(bool enabled);

    constructor(address defaultRoyaltyReceiver, uint96 defaultRoyaltyBps) ERC721("TrueD8Profile", "TD8P") {
        // Start token IDs at 1 for clarity
        _tokenIdCounter.increment();

        // Optionally set default royalty; if you don't want royalties, pass address(0) or 0 bps
        if (defaultRoyaltyReceiver != address(0) && defaultRoyaltyBps > 0) {
            _setDefaultRoyalty(defaultRoyaltyReceiver, defaultRoyaltyBps);
        }
    }

    // -----------------------
    // Minting / Burning
    // -----------------------

    /**
     * @notice Mint your own profile NFT pointing to an IPFS URI (or any URI).
     * @param ipfsUri Example: "ipfs://Qm..." or any http(s) link
     */
    function mintProfile(string calldata ipfsUri) external returns (uint256) {
        if (oneProfilePerAddress) {
            require(_ownerToToken[msg.sender] == 0, "Profile: already has one");
        }

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, ipfsUri);

        // record mapping (we use tokenId 0 as empty sentinel)
        _ownerToToken[msg.sender] = tokenId;

        emit ProfileMinted(msg.sender, tokenId, ipfsUri);
        return tokenId;
    }

    /**
     * @notice Admin mint (for onboarding, promotions, etc.)
     */
    function adminMint(address to, string calldata ipfsUri) external onlyOwner returns (uint256) {
        require(to != address(0), "Invalid address");

        if (oneProfilePerAddress) {
            require(_ownerToToken[to] == 0, "Profile: recipient has one");
        }

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsUri);
        _ownerToToken[to] = tokenId;

        emit ProfileMinted(to, tokenId, ipfsUri);
        return tokenId;
    }

    /**
     * @notice Burn a profile. Only owner or approved can burn.
     */
    function burn(uint256 tokenId) external {
        address owner = ownerOf(tokenId);
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner nor approved");

        _burn(tokenId);

        // cleanup mappings if needed
        if (_ownerToToken[owner] == tokenId) {
            _ownerToToken[owner] = 0;
        }
        // delete uri and locked flag
        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
        }
        if (metadataLocked[tokenId]) {
            delete metadataLocked[tokenId];
        }

        emit ProfileBurned(owner, tokenId);
    }

    // -----------------------
    // Metadata management
    // -----------------------

    /**
     * @notice Set token URI. Only token owner or approved can call.
     * Works only if metadata is not locked.
     */
    function setTokenURI(uint256 tokenId, string calldata ipfsUri) external {
        require(_exists(tokenId), "Nonexistent token");
        require(!_isMetadataLocked(tokenId), "Metadata locked");
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner nor approved");

        _setTokenURI(tokenId, ipfsUri);
        emit MetadataUpdated(tokenId, ipfsUri);
    }

    /**
     * @notice Lock metadata permanently for a token (irreversible).
     * Only token owner can lock.
     */
    function lockMetadata(uint256 tokenId) external {
        require(_exists(tokenId), "Nonexistent token");
        require(ownerOf(tokenId) == msg.sender, "Only owner can lock");
        require(!_isMetadataLocked(tokenId), "Already locked");

        metadataLocked[tokenId] = true;
        emit MetadataLocked(tokenId);
    }

    function _isMetadataLocked(uint256 tokenId) internal view returns (bool) {
        return metadataLocked[tokenId];
    }

    // Internal setter for tokenURI
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        _tokenURIs[tokenId] = _tokenURI;
    }

    /**
     * @notice Override tokenURI to return the stored URI.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory _uri = _tokenURIs[tokenId];
        return _uri;
    }

    // -----------------------
    // One-profile-per-address helpers
    // -----------------------

    /**
     * @notice Get token id of user's profile (0 if none).
     */
    function tokenOfOwner(address owner) external view returns (uint256) {
        return _ownerToToken[owner];
    }

    /**
     * @notice Admin toggle whether only one profile per address allowed.
     */
    function setOneProfilePerAddress(bool enabled) external onlyOwner {
        oneProfilePerAddress = enabled;
        emit OneProfilePerAddressToggled(enabled);
    }

    // -----------------------
    // Base URI (optional)
    // -----------------------

    string private _baseUriForGateway;

    function setBaseURI(string calldata baseUri) external onlyOwner {
        _baseUriForGateway = baseUri;
    }

    /**
     * @notice If a tokenURI is stored as an IPFS CID (no scheme), consumers
     * could call `baseURI()` + tokenURI. Prefer passing full `ipfs://` URIs
     * directly to mint functions. This hook exists to enable gateway toggles.
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseUriForGateway;
    }

    // -----------------------
    // ERC2981 royalties (optional)
    // -----------------------

    /**
     * @notice Set contract-wide default royalty (bps: 10000 = 100%).
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function deleteDefaultRoyalty() external onlyOwner {
        _deleteDefaultRoyalty();
    }

    // -----------------------
    // Overrides required by Solidity
    // -----------------------

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        // maintain owner->token mapping if oneProfilePerAddress enabled
        if (oneProfilePerAddress) {
            if (from != address(0)) {
                // clearing mapping for previous owner if it pointed here
                if (_ownerToToken[from] == tokenId) {
                    _ownerToToken[from] = 0;
                }
            }
            if (to != address(0)) {
                // prevent recipient if they already have a profile
                require(_ownerToToken[to] == 0, "Recipient already has a profile");
                _ownerToToken[to] = tokenId;
            }
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
