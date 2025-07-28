import { walletConnect } from "@wagmi/connectors";
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { seiTestnet } from "viem/chains";

const metadata = {
  name: "SeiMoney",
  description: "SeiMoney",
  url: "https://seimoney.link",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const chains = [seiTestnet];

export const config = defaultWagmiConfig({
  chains: chains as any,
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
  metadata,
  connectors: [
    walletConnect({
      projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
    }),
  ],
});
