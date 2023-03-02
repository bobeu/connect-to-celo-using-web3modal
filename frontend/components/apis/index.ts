import getContractData from "./contractdata";
import { InstanceProps, OptionProps, Profile, transactionResult } from "@/interfaces";
import { ethers, Contract, ContractReceipt } from "ethers";
import { EIP1193Provider } from "@web3-onboard/core";

// Return provider and signer
function wrappedProvider(provider: EIP1193Provider) {
  if (!provider) alert('Provider not ready');
  return new ethers.providers.Web3Provider(provider, 'any');
}

// get contract instances
function contractInstances(props: InstanceProps) {
  const { tokenAbi, vaultAbi, tokenAddr,vaultAddr, provider } = props;
  if(!provider) alert('Provider not ready');
  const vault_ins = new Contract(vaultAddr, vaultAbi, wrappedProvider(provider).getSigner());
  const vault_ins_noSigner = new Contract(vaultAddr, vaultAbi, wrappedProvider(provider));
  const token_ins = new Contract(tokenAddr, tokenAbi, wrappedProvider(provider).getSigner());
  const token_ins_noSigner = new Contract(tokenAddr, tokenAbi, wrappedProvider(provider));

  return { vault_ins, token_ins, vault_ins_noSigner, token_ins_noSigner }
}

async function sendtransaction(options: OptionProps) {
  const { provider, cancelLoading, functionName, value, account, who } = options;
  const { vaultAbi, tokenAbi, vaultAddr, tokenAddr } = getContractData();
  const { vault_ins, token_ins_noSigner } = contractInstances({
    vaultAbi,
    tokenAbi,
    vaultAddr,
    tokenAddr,
    provider
  })

  let result = transactionResult;
  try {
    switch (functionName) {
      case 'stake':
        const txn = await vault_ins.stake({value: value });
        // const txn = await vault_ins.setToken(tokenAddr);
        await txn?.wait(2).then((rec: ContractReceipt) => {
          result.receipt = rec;
          result.view = false;
          if(cancelLoading) cancelLoading();
        });
        break;

      case 'stakeOnBehalf':
        const txn_1 = await vault_ins.stakeOnBehalf(who, {value: value });
        await txn_1?.wait(2).then((rec: ContractReceipt) => {
          result.receipt = rec;
          result.view = false;
          if(cancelLoading) cancelLoading();
        });
        break;
      
      case 'unstake':
        const txn2 = await vault_ins.unstake();
        await txn2?.wait(2).then((rec: ContractReceipt) => {
          result.receipt = rec;
          result.view = false;
          if(cancelLoading) cancelLoading();
        });
        break;

      case 'withdraw':
        const txn3 = await vault_ins.withdraw();
        await txn3?.wait(2).then((rec: ContractReceipt) => {
          result.receipt = rec;
          result.view = false;
          if(cancelLoading) cancelLoading();
        });
        break;

      case 'getStakeProfile':
        await vault_ins.getStakeProfile().then((res: Profile) => {
          result.read = res;
          result.view = true;
          if(cancelLoading) cancelLoading();
        });
        break;

      case 'balance':
        await token_ins_noSigner.balanceOf(account).then((res: ethers.BigNumber) => {
          console.log("RESULT", res);
          result.read = res;
          result.view = true;
          if(cancelLoading) cancelLoading();
        });
      break;

      default:
        break;
      }
      
    } catch (error: any) {
      console.log(error);
      if(cancelLoading) cancelLoading();
      if(error){
        if(error.data?.code === -32000) alert("Please fund your wallet with test Celo from https://faucet.celo.org");
      }
    }
  return result;
};

export default sendtransaction;