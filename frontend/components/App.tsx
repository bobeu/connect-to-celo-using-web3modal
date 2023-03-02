import React, { useMemo, Key } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Footer from "../components/Footer";
import { notification } from "antd";
import getContractData from "../components/apis/contractdata";
import { Address } from "./Address";
import { AppProps, MockProfile, NotificationProps, TransactionResultProp } from "../interfaces";
import { blue, purple } from "@mui/material/colors";
import sendtransaction from "./apis";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import { Spinner } from "./Spinner";
import Web3 from "web3";
import Image from "next/image";
import { useWallets } from '@web3-onboard/react';

const boxStyle = {
  profile_style: {
    display: 'flex',
    justifyContent: 'center',
    gap: 2,
    alignItems: 'center',
    width: 'fit-content',
  },
  topButton: {
    color: 'whitesmoke',
    width: 'fit-content',
    // background: purple[300],
    // color: green[500]
  }
}

const ZERO_ACCOUNT = `0x${'0'.repeat(40)}`;

function getTimeFromEpoch(onchainUnixTime:BigNumber) {
  const toNumber = onchainUnixTime? onchainUnixTime.toNumber() : 0;
  var newDate = new Date(toNumber * 1000);
  return `${newDate.toLocaleDateString("en-GB")} ${newDate.toLocaleTimeString("en-US")}`;
}

export default function App(props: AppProps) {
  const [functionName, setFunctionName] = React.useState<string>("stake");
  const [amountToStake, setAmountToStake] = React.useState<number>(0);
  const [tokenRewardBalance, setReward] = React.useState<any>(BigNumber('0.00'));
  const [response, setResponse] = React.useState<any>(MockProfile);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [accountFor, setAccount] = React.useState<string>('');

  const connectedWallets = useWallets();
  const account = connectedWallets.length? connectedWallets[0].accounts[0].address : ZERO_ACCOUNT;
  const provider = connectedWallets[0]?.provider;
  const { vaultAbi } = getContractData();
  const { logout, reconnect } = props;

  const handleAmountChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    e.preventDefault();
    setAmountToStake(Number(e.target.value));
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    e.preventDefault();
    setAccount(e.target.value);
  };

  const cancelLoading = () => setLoading(false);

  React.useEffect(() => {
    const abortProcess = new AbortController();
    async function getTokenBalance() {
      if(account && provider) {
        const res :TransactionResultProp = await sendtransaction({
          account: account, 
          functionName: 'balance', 
          cancelLoading: cancelLoading,
          provider: provider
        });

        console.log("res.read", res.read);
        setReward(res.read);
      }
    }

    getTokenBalance();
    return () => abortProcess.abort();
  }, [response, account]);

  const handleContractFunction = (x: string) => setFunctionName(x);

  const displayContractFunctions = useMemo(() => {
    let filt: any;
    if (!vaultAbi) return [];
    filt = vaultAbi.filter(method => method["type"] === "function");
    return filt.filter((method: { name: string }) => method.name === "stake" || method.name === "unstake" || method.name === "stakeOnBehalf");
  }, [vaultAbi]);

  const displayedViewFunctions = useMemo(() => {
    let filtered: any;
    if (!vaultAbi) return [];
    filtered = vaultAbi.filter(method => method["type"] === "function");
    return filtered.filter((method: { name: string }) => method.name === "getStakeProfile" || method.name === "withdraw");
  }, [vaultAbi]);

  const openNotification = (props: NotificationProps) => {
    const { message, description } = props;

    notification.open({
      placement: "bottomRight",
      message,
      description,
      onClick: () => {
        console.log("Notification Clicked!");
      }
    });
  };

  async function stake(address?: string): Promise<TransactionResultProp> {
    if (amountToStake === 0) {
      const msg = "Please enter amount of Celo to stake in wei";
      cancelLoading();
      alert(msg);
      throw new Error(msg);
    }
    if(!provider) alert('Wallet not ready');
    const amtInBigNumber = BigNumber(amountToStake);
    const value = ethers.utils.hexValue(ethers.utils.parseUnits(amtInBigNumber.toString()));
    return await sendtransaction({ 
      value: value, 
      functionName: functionName, 
      cancelLoading: cancelLoading,
      who: address,
      provider: provider
    });
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let result: TransactionResultProp;
    setLoading(true);

    switch (functionName) {
      case 'stake':
        result = await stake();
        break;

      case 'stakeOnBehalf':
        if(!accountFor) return null;
        result = await stake(accountFor);
        break;

      case "unstake":
        result = await sendtransaction({
          functionName: functionName,
          cancelLoading: cancelLoading,
          provider: provider
        });
        break;

      case 'getStakeProfile':
        result = await sendtransaction({
          functionName: functionName,
          cancelLoading: cancelLoading,
          provider: provider
        });
        break;

      default:
        result = await sendtransaction({
          functionName: "withdraw",
          cancelLoading: cancelLoading,
          provider: provider
        });
        break;
    }
    if(result?.view === false) {
      openNotification({message: "Transaction completed with hash:", description: result?.receipt.transactionHash});
    } else {
      setResponse(result?.read);
    }
  };

  console.log("Tokenbalance", tokenRewardBalance);
  return (
    <React.Fragment>
      {/* <CssBaseline /> */}
      <Container maxWidth='md' component={'main'}>
        <AppBar position="static" sx={{background:'none'}}>
          <Toolbar sx={boxStyle.profile_style}>
            {/* <Box sx={boxStyle.profile_style}> */}
              <Button variant="outlined" style={boxStyle.topButton} startIcon='Vault Balance:' endIcon={`${response?.account ? Web3.utils.fromWei(response?.celoAmount?.toString()) : 0} ${' $Celo'}`} />
              <Button variant="outlined" style={boxStyle.topButton} startIcon='Staked time:' endIcon={getTimeFromEpoch(response?.depositTime)} />
              <Button variant="outlined" style={boxStyle.topButton} startIcon='RTK Reward:' >{Web3.utils.fromWei(tokenRewardBalance.toString())}</Button>
            {/* </Box> */}
          </Toolbar>
        </AppBar>
      </Container>
      <Container maxWidth='sm' component={'main'} sx={{placeItems: 'center'}}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'right',
          alignItems: 'center'
        }}>
          {/* <Typography variant="h6" component="div" sx={{ display: 'flex', justifyContent: 'space-around', alignItems:'center'}}>
            <span style={{color: 'green'}}>Connected!:</span> <Address account={account} size={6} copyable={true} display />
          </Typography> */}
          <Button 
            sx={{
              color: account !== ZERO_ACCOUNT? purple[300] : 'white'
            }}
            startIcon={
              account !== ZERO_ACCOUNT? 'Disconnect' : 'Reconnect'
            } 
            variant='outlined' 
            onClick={
              async() => {
                if(connectedWallets.length) {
                  await logout();
                } else {
                  await reconnect();
                }
              }
            } 
          />
        </Box>
        <Box
          sx={{
            marginTop: 8,
            display: "grid",
            // flexDirection: "column",
            alignItems: "center"
          }}
        >
          <div className="marquee">
            <p className='inner' > Mininum staking : 0.1 $CELO </p>
          </div>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Avatar sx={{ m: 1,}}>
              <Image src='/celologopng.png' width={100} height={40} alt='celoLogo'/>
            </Avatar>
          </div>
          <Typography component="h1" variant="h5" sx={{display: 'flex',justifyContent: 'space-around'}}>
            <span style={{color: 'blue'}}>Stake $ Celo</span> <span style={{color: purple[300]}}> Earn $RTK</span>
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Box
              sx={{
                marginTop: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div className="funcDiv">
                <Typography variant="h5">Transact</Typography>
                {displayContractFunctions.map((item: any, id: Key) => (
                  <Button
                    sx={{
                      "&:hover": {
                        color: "whitesmoke",
                        width: "fit-content",
                        border: `0.1em solid ${purple[900]}`
                      }
                    }}
                    onClick={() => handleContractFunction(item.name)}
                    key={id}
                    variant={"text"}
                  >
                    {item?.name}
                  </Button>
                ))}
              </div>
              <div className="funcDiv">
                <Typography variant="h5">Read</Typography>
                {displayedViewFunctions.map((item: any, id: Key) => (
                  <Button
                    sx={{
                      "&:hover": {
                        color: "whitesmoke",
                        width: "fit-content",
                        border: `0.1em solid ${purple[900]}`
                      }
                    }}
                    onClick={() => handleContractFunction(item?.name)}
                    key={id}
                    variant={"text"}
                  >
                    {item?.name}
                  </Button>
                ))}
              </div>
            </Box>
            {(functionName === "stake" || functionName === "stakeOnBehalf") && <TextField margin="normal" required fullWidth id="text" label="Amount to stake" name="amount" autoComplete="amount" type={"number"} autoFocus sx={{ border: `0.1em solid ${blue[900]}`, borderRadius: "5px" }} style={{ color: "whitesmoke" }} onChange={(e) => handleAmountChange(e)} />}
            {functionName === "stakeOnBehalf" && <TextField margin="normal" required fullWidth id="text" label="Account to stake for" name="amount" autoComplete="account" type={"text"} autoFocus sx={{ border: `0.1em solid ${blue[900]}`, borderRadius: "5px" }} style={{ color: "whitesmoke" }} onChange={(e) => handleAccountChange(e)} />}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                height: '100px',
                fontWeight: "bold",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: purple[300]
              }}
            >
              { loading? <span>Trxn in Progress ... <Spinner color={"white"} /></span> : functionName }
            </Button>
          </Box>
        </Box>
      </Container>
      <Footer sx={{ mt: 8, mb: 4 }} />
    </React.Fragment>
  );
}
