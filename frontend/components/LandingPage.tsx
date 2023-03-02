import React, { useState} from "react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { PageProps } from "@/interfaces";
import { green, purple } from "@mui/material/colors";
import Footer from "./Footer";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import ConnectButton from "./ConnectButton";

export default function LandingPage(props: PageProps) {
  const { handleConnect } = props;

  return (
    <React.Fragment>
      <Container maxWidth='md'>
        <div className="topDiv">
          <Stack className="divHeader" textAlign={"revert-layer"} >
            <Typography component={"main"} variant="h2">Celo StakeVerse V2</Typography>
            <Typography component={"main"} variant="h3">Stake Celo to earn RTK Token</Typography>
            <Typography component={"main"} variant="h5">Made by <span>
              <Link color="inherit" href="https://github.com/bobeu" style={{color: green[600]}}>
                Isaac Jesse 
              </Link> a.k.a Bobelr | Bobeu</span>
            </Typography>
            <Link color="inherit" href="https://github.com/bobeu/stakingdapp-on-celo" style={{color: purple[700]}}>
              Source code
            </Link>
          </Stack>
          <div className="divHeader"></div>
          <div className="lowerDiv">
            <ConnectButton connect={handleConnect} />
          </div>
        </div>
      </Container>
      <Footer sx={{ mt: 8, mb: 4 }} />
    </React.Fragment>
  );
}
