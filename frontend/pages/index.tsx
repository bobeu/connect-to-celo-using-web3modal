import React from "react";
import {ethers} from 'ethers';
// import App from "../components/App";
// import { ConnectObj } from "../interfaces";
// import LandingPage from "../components/LandingPage";
// import { providerOptions } from "../web3ProviderOptions";
// import Web3Modal from "web3modal";
import App from "../components/App";
import Header from "../components/Header";

function toHex(x:number) {
  return ethers.utils.hexlify(x);
}

export default function Home() {
  // const [connectObject, setConnectObj] = React.useState<ConnectObj>();

  // const setconnectObj = (x:ConnectObj) => setConnectObj(x);
  
  // const web3Modal = new Web3Modal({
  //   // providerOptions,
  //   // cacheProvider: false,
  //   network: 'Alfajores',
  // });

  // const switchNetwork = async () => {
  //   const library = connectObject?.provider;
  //   if(library) {
  //     try {
  //       await library?.request({
  //         method: "wallet_switchEthereumChain",
  //         params: [{ chainId: toHex(44787) }],
  //       });
  //     } catch (switchError: any) {
  //       // This error code indicates that the chain has not been added to MetaMask.
  //       if (switchError?.code === 4902) {
  //         try {
  //           await library.provider.request({
  //             method: "wallet_addEthereumChain",
  //             params: [
  //               {
  //                 chainId: toHex(44787),
  //                 chainName: "Celo",
  //                 rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  //                 blockExplorerUrls: ["https://explorer.celo.org/"],
  //               },
  //             ],
  //           });
  //         } catch (addError) {
  //           throw addError;
  //         }
  //       }
  //     }
  //   }
  // };

  // React.useEffect(() => {
  //   if (connectObject?.provider?.on) {
  //     const connectObjCp = connectObject;
  //     const handleAccountsChanged = (accounts: string[]) => {
  //       connectObjCp.address = accounts[0];
  //       setConnectObj(connectObjCp);
  //     };
  
  //     const handleDisconnect = () => {
  //       connectObjCp.isUserAuthenticated = false;
  //       setConnectObj(connectObjCp);
  //     };

  //     const provider = connectObject.provider;
  //     provider.on("accountsChanged", handleAccountsChanged);
  //     provider.on("disconnect", handleDisconnect);
  
  //     return () => {
  //       if (provider.removeListener) {
  //         provider.removeListener("accountsChanged", handleAccountsChanged);
  //         provider.removeListener("disconnect", handleDisconnect);
  //       }
  //     }  
  //   }
  // }, [connectObject]);

  // const disconnectHandler = async() => {
  //   web3Modal.clearCachedProvider();
  //   await handleConnect();
  // }
  
  // async function handleConnect() {
  //   const cob = connectObject;
  //   if(cob?.isUserAuthenticated) return;
  //   console.log("It run")
  //   try {
  //     await web3Modal.connect().then(async(externalProvider: ethers.providers.ExternalProvider | ethers.providers.JsonRpcFetchFunc) => {
  //       const provider = new ethers.providers.Web3Provider(externalProvider);
  //       const address = await provider.getSigner(0).getAddress();
  //       setConnectObj({
  //         provider,
  //         address,
  //         isUserAuthenticated: true,
  //         balance: ethers.utils.formatEther(await provider.getBalance(address))
  //       })
  //       await switchNetwork();
  //     });
  //   } catch (error) {
  //     console.log("Connect Error", error);
  //   }
  // }

  // async function logout() {
  //   const cob = connectObject;
  //   if (!cob?.isUserAuthenticated) throw new Error("User not authenticated");
  //   await disconnectHandler().then(() => {
  //     cob.isUserAuthenticated = true;
  //     setConnectObj(cob);
  //   });
  // }

  return (
    <main style={{background: '#000'}}>
      <Header 
        // handleConnect={handleConnect} 
        // logout={logout} 
        // state={connectObject}
        // setState={setconnectObj}
      />
      <App 
        // handleConnect={handleConnect} 
        // state={connectObject}
        // setState={setconnectObj}
      />
    </main>
  );
}
