import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import runContractFunc from '../apis';
import { Home } from './Home';
import { AppProtected } from './AppProtected';
import { useAccount } from 'wagmi';

const theme = createTheme();

export default function App() {
  const [isUser, setAuth] = React.useState(false);
  const { isConnected, address, connector } = useAccount();

  React.useEffect(() => {
    const abortOp = new AbortController();
    if(connector) {
      const getBalance = async() => {
        const provider = connector?.getProvider();
        const result = await runContractFunc({
          functionName: 'nftBalance',
          account: address,
          providerOrSigner: provider
        });
        result.balanceOrAllowance.toNumber()  > 0 && setAuth(true);
        console.log("Bal", result.balanceOrAllowance.toNumber());
    }
    getBalance();
  
  }

    return () => abortOp.abort()
  }, [connector])


  return (
    <ThemeProvider theme={theme}>
      { isConnected? <AppProtected /> : <Home /> }
    </ThemeProvider>
  )
}


