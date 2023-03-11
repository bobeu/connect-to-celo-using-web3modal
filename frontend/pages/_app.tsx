import React from 'react'
import '@/styles/globals.css';
import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import type { AppProps } from 'next/app';
import { WagmiConfig } from 'wagmi';
import { Web3Modal } from '@web3modal/react';
import { ethereumClient, projectId, wagmiClient } from '@/web3ProviderOptions';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = React.useState<boolean>(false);
  React.useEffect(() => setMounted(true), []);

  return(
    <React.Fragment>
      <Head>
        <title>SwapLab</title>
        <meta name="description" content="decentralized token swap on Celo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        {mounted ? (
          <WagmiConfig client={wagmiClient}>
            <Component {...pageProps} />
          </WagmiConfig>
        ) : null}
        {/* { mounted && <Component {...pageProps} />} */}
        <Web3Modal projectId={String(projectId)} ethereumClient={ethereumClient} />
      </main>
    </React.Fragment>
  );
}
