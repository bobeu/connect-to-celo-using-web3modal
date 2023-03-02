import React from "react";
import App from "../components/App";
import LandingPage from "../components/LandingPage";
import { useConnectWallet, useSetChain, useWallets } from "@web3-onboard/react";
import { web3Onboard } from "@/components/apis/web3Onboard/setup";

export default function Home() {
  const [isUserAuthenticated, setAuthentication] = React.useState<boolean>(false);
  const [, connect, , disconnect] = useConnectWallet();

  async function handleConnect() {
    if (isUserAuthenticated) return;
    try {
      await web3Onboard?.connectWallet().then(walletStates => {
        if (walletStates.length) {
          setAuthentication(true);
          console.log(walletStates[0].accounts[0].address);
        }
      });
    } catch (error) {
      console.log("Connect Error", error);
    }
  }

  async function logout() {
    if (!isUserAuthenticated) throw new Error("User not authenticated");
    await disconnect().then(() => {
      setAuthentication(false);
    });
  }

  return <>{!isUserAuthenticated ? <LandingPage isUserAuthenticated={isUserAuthenticated} handleConnect={handleConnect} /> : <App logout={logout} reconnect={connect} />}</>;
}
