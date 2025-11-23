import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { AlgorandWalletConnectors } from "@dynamic-labs/algorand";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { FlowWalletConnectors } from "@dynamic-labs/flow";
import { StarknetWalletConnectors } from "@dynamic-labs/starknet";
import { CosmosWalletConnectors } from "@dynamic-labs/cosmos";
import { BitcoinWalletConnectors } from "@dynamic-labs/bitcoin";
import { SuiWalletConnectors } from "@dynamic-labs/sui";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";

import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors, AlgorandWalletConnectors, SolanaWalletConnectors, FlowWalletConnectors, StarknetWalletConnectors, CosmosWalletConnectors, BitcoinWalletConnectors, SuiWalletConnectors],
      }}
    >
      <App />
    </DynamicContextProvider>
  </StrictMode>
);