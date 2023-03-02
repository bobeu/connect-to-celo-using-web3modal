import vault from "../../../foundry/out/Vault.sol/Vault.json";
import token from "../../../foundry/out/RewardToken.sol/RewardToken.json";

export default function getContractData() {
  return {
    vaultAbi: vault.abi,
    tokenAbi: token.abi,
    vaultAddr: "0x89330624480dE7Fc2e651233B022B85a1F998de7",
    tokenAddr: "0xefA906f63ea950318d8d5Af13ae2E5D2aC221Fe4"
  }
}
