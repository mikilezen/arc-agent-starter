import { createPublicClient, defineChain, http } from "viem";

export const arcChainId = 5042002;
export const arcRpcUrl = "https://rpc.testnet.arc.network";
export const arcExplorerUrl = "https://explorer.testnet.arc.network";
export const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as const;

export const arcTestnet = defineChain({
  id: arcChainId,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
  },
  rpcUrls: {
    default: { http: [arcRpcUrl] },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: arcExplorerUrl,
    },
  },
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
});

export const arcConfig = {
  chainId: arcChainId,
  rpcUrl: arcRpcUrl,
  USDC: usdcAddress,
  blockExplorer: arcExplorerUrl,
} as const;