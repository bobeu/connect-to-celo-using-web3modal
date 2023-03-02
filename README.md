# Connect and interact with Celo using web3Onboard library 

- Backend
  - Stacks
    - Foundry
    - Solidity

For full understanding of the backend, follow **[this tutorial](https://docs.celo.org/blog/tutorials/connect-and-interact-with-celo-using-web3onboard-library)**

- Frontend
  - Stacks
    - React
    - NextJs
    - MaterialUi
    - etherJs
    - We3Js

**How to run**
> Note : Be sure to have either of the following browser wallet extension installed.

- **[Coinbase wallet](https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad?hl=en)**

- **[Metamask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)**

```bash
git clone https://github.com/bobeu/connect-to-celo-using-web3onboard-library.git/
```

```bash
cd connect-to-celo-using-web3onboard-library/frontend
```

```bash
yarn install
```

```bash
yarn run dev
```

<!-- **[Watch this video to know how to do that](https://youtu.be/8H-tctoES3Q)** -->

# Smart contracts

- Compiling

```bash
forge build
```

- Testing

```bash
forge test
```

- Deployment

_Deploying Vault.sol_

```bash 
forge create --rpc-url https://alfajores-forno.celo-testnet.org --constructor-args 10000000000000000000 --private-key <paste your private key here> src/Vault.sol:Vault
```

Output
```bash
[⠢] Compiling 2 files with 0.8.17
[⠰] Solc 0.8.17 finished in 3.04s
Compiler run successful
# Deployer: 0x85AbBd0605F9C725a1af6CA4Fb1fD4dC14dBD669
Vault Deployed to: 0x89330624480dE7Fc2e651233B022B85a1F998de7
Transaction hash: 0x97264f5b6c94d738e798aa440b98de1ccaccb47b31954e56e16078766723bac7     
```

_Deploying RewardToken.sol_

```bash 
forge create --rpc-url https://alfajores-forno.celo-testnet.org --constructor-args 500000000--private-key <paste your private key here> src/RewardToken.sol:RewardToken
```

Output

```bash
[⠔] Compiling 1 files with 0.8.17
[⠃] Solc 0.8.17 finished in 4.67s
Compiler run successful
# Deployer: 0x85AbBd0605F9C725a1af6CA4Fb1fD4dC14dBD669
Token Deployed to: 0xefA906f63ea950318d8d5Af13ae2E5D2aC221Fe4
Transaction hash: 0x5e430c21123e8e785765b8c7e501506d835e489de320d1c662b3cc6ea287e474
```

- Demo

**[Click to interact with Dapp](https://connect-to-celo-using-web3onboard-library.vercel.app/)**
