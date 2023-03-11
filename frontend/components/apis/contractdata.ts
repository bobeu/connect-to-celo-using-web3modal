import swapLab from "../../../backend/deployments/alfajores/SwapLab.json";
import testToken from "../../../backend/deployments/alfajores/TestToken.json";
import member from "../../../backend/deployments/alfajores/Membership.json";
import testToken2 from "../../../backend/deployments/alfajores/TestToken2.json";

export default function getContractData() {
  return {
    swapAbi: swapLab.abi,
    swapLabAddr: swapLab.address,
    testTokenAbi: testToken.abi,
    test2TokenAbi: testToken2.abi,
    test2Addr: testToken2.address,
    testAddr: testToken.address,
    memberAbi: member.abi,
    memberAddr: member.address
  }
}