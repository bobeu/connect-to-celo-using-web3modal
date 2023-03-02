import { init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import coinbaseWallet from "@web3-onboard/coinbase";
import walletConnectModule from "@web3-onboard/walletconnect";
import { ChainParams } from "@/interfaces";
import { ethers } from "ethers";

const API_KEY = process.env.BLOCKNATIVE_API_KEY

const injected = injectedModule();
const coinbase = coinbaseWallet();
const walletconnect = walletConnectModule();

// Converts chain id in number mode to hex value
export function hexlify(chainid: number) {
  return ethers.utils.hexValue(chainid);
}

const ALFAJORES: ChainParams = {
  key: 1,
  icon: '/celologopng.png',
  chainIdStr: hexlify(44787),
  chainName: "CeloAlfajores",
  rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  nativeCurrency: { name: "CELO", decimals: 18, symbol: "CELO" },
  blockExplorerUrls: ["https://explorer.celo.org"],
  iconUrls: [""]
};

const CHAINS = [
  {
    id: ALFAJORES.chainIdStr,
    token: ALFAJORES.nativeCurrency.name,
    label: ALFAJORES.chainName,
    rpcUrl: ALFAJORES.rpcUrls[0],
  }
]

export const web3Onboard = init({
  wallets: [injected, coinbase, walletconnect],
  chains: [...CHAINS],
  apiKey: API_KEY,
  appMetadata: {
    name: "Celo stkingdapp",
    icon: "celologopng.png",
    logo: "celologopng.png",
    description: "A simple generic staking dapp",
    recommendedInjectedWallets:[
      {name: 'Coinbase', url: "https://wallet.coinbase.com"},
      {name: 'Metamask', url: "https://metamask.io"}
    ],
  },
  accountCenter: {
    desktop: {
      position: 'topLeft',
      enabled: true,
      minimal: false
    },
    mobile: {
      enabled: true,
      minimal: true,
      position: 'topRight'
    }
  },
  notify: {
    position: "bottomRight",
    transactionHandler: transaction => {
      console.log({ transaction })
      if (transaction.eventCode === 'txPool') {
        return {
          autoDismiss: 0,
          onClick: () =>
            window.open(`${ALFAJORES.blockExplorerUrls[0]}/tx/${transaction.hash}`)
        }
      }
    }
  },
});