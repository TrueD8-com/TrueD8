// PYUSD Contract Configuration
// PYUSD is deployed on multiple networks

export const PYUSD_ADDRESSES = {
  // Mainnet PYUSD Contract
  1: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8" as `0x${string}`,
  // Sepolia Testnet (using a mock address for demo)
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`,
  // Base Mainnet
  8453: "0x4D7b8Ac5c0C2e53A94e4d5Ba0e9E50F5f3d1c0A8" as `0x${string}`,
  // Base Sepolia
  84532: "0x2D7b8Ac5c0C2e53A94e4d5Ba0e9E50F5f3d1c0B9" as `0x${string}`,
} as const;

// ERC20 ABI - Only functions we need
export const ERC20_ABI = [
  // Read functions
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
] as const;

// Staking Contract (Mock for demo - to be deployed)
export const STAKING_ADDRESSES = {
  1: "0x0000000000000000000000000000000000000001" as `0x${string}`,
  11155111: "0x0000000000000000000000000000000000000002" as `0x${string}`,
  8453: "0x0000000000000000000000000000000000000003" as `0x${string}`,
  84532: "0x0000000000000000000000000000000000000004" as `0x${string}`,
} as const;

export const STAKING_ABI = [
  {
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "dateCommitmentId", type: "bytes32" },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "dateCommitmentId", type: "bytes32" }],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "dateCommitmentId", type: "bytes32" },
    ],
    name: "getStake",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Supported chains for payments
// Expanded to include Avail Nexus supported chains
export const SUPPORTED_CHAINS = [
  // Mainnet chains
  { id: 1, name: "Ethereum", icon: "⟠", network: "mainnet" },
  { id: 10, name: "Optimism", icon: "🔴", network: "mainnet" },
  { id: 137, name: "Polygon", icon: "🟣", network: "mainnet" },
  { id: 42161, name: "Arbitrum", icon: "🔵", network: "mainnet" },
  { id: 43114, name: "Avalanche", icon: "🔺", network: "mainnet" },
  { id: 8453, name: "Base", icon: "🔵", network: "mainnet" },

  // Testnet chains (Avail Nexus supported)
  { id: 11155111, name: "Sepolia", icon: "⟠", network: "testnet" },
  { id: 84532, name: "Base Sepolia", icon: "🔵", network: "testnet" },
  { id: 80002, name: "Polygon Amoy", icon: "🟣", network: "testnet" },
  { id: 421614, name: "Arbitrum Sepolia", icon: "🔵", network: "testnet" },
  { id: 11155420, name: "Optimism Sepolia", icon: "🔴", network: "testnet" },
] as const;

// Supported tokens for omnichain payments
export const SUPPORTED_TOKENS = [
  {
    symbol: "PYUSD",
    name: "PayPal USD",
    addresses: PYUSD_ADDRESSES,
    decimals: 6,
    icon: "💵",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    addresses: {
      1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7239",
      8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    },
    decimals: 6,
    icon: "💵",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    addresses: {
      1: "0x0000000000000000000000000000000000000000",
      11155111: "0x0000000000000000000000000000000000000000",
      8453: "0x0000000000000000000000000000000000000000",
      84532: "0x0000000000000000000000000000000000000000",
    },
    decimals: 18,
    icon: "⟠",
  },
] as const;

export type ChainId = keyof typeof PYUSD_ADDRESSES;
