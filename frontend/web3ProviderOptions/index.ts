// import React from "react";
// import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
// import WalletConnect from "@walletconnect/web3-provider";
// import { injected } from "web3modal";
// import { Web3Button, Web3NetworkSwitch } from '@web3modal/react';

// export const providerOptions = {
//   injected,
//   coinbasewallet: {
//     package: CoinbaseWalletSDK, 
//     options: {
//       appName: "Multisig",
//       infuraId: process.env.NEXT_PUBLIC_PROJECT_ID 
//     }
//   },
//   walletconnect: {
//     package: WalletConnect, 
//     options: {
//       infuraId: process.env.NEXT_PUBLIC_PROJECT_ID 
//     }
//   }
// };




import { useEffect, useState } from 'react';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { configureChains, createClient } from 'wagmi'
import { celoAlfajores } from 'wagmi/chains'

// 1. Get projectID at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID
if (!projectId) {
  throw new Error('ID Error')
}
const chains = [ celoAlfajores ]

const { provider } = configureChains(chains, [w3mProvider({ projectId })])
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ version: 1, chains, projectId }),
  provider
})

export const ethereumClient = new EthereumClient(wagmiClient, chains);