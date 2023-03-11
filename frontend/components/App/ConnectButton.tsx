import { useWeb3Modal } from '@web3modal/react';
import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import Button from '@mui/material/Button';
import { Spinner } from '../Spinner';

export default function ConnectButton() {
  const [loading, setLoading] = useState(false)
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const label = isConnected ? 'Disconnect' : 'Connect Wallet'

  async function openModal() {
    setLoading(true)
    await open()
    setLoading(false)
  }

  function onClick() {
    if (!isConnected) openModal();
    else disconnect();
  }

  return (
    <Button variant='contained' onClick={onClick} disabled={loading}>
      {loading ? <Spinner color='white'/> : label}
    </Button>
  )
}