import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import './App.css';

export default function App() {

 //See if we can access the user's account
 
  const [currentAccount, setCurrentAccount] = useState("")
  const contractAddress = "0x46974aeB793c2E3C4470B942cbE5B3458d284a38"
  const contractABI = abi.abi

  const checkIfWallet = async() => {
    try{
      const { ethereum } = window

      if (!ethereum){
        console.log( "Make sure you have a metamask wallet!")
      } else {
        console.log("We have the ethereum object", ethereum)
      }

      //special method to access account in user wallet (eth_accounts)
  const accounts = await ethereum.request({ method: "eth_accounts" })


  if (accounts.length !== 0) {
    const account = accounts[0];
    console.log("Found an authorized account:", account);
    setCurrentAccount(account)
  } else {
    console.log("No authorized account found")
    }
} catch (error) {
  console.log(error);
}
}

// connect wallet method

const connectWallet = async() => {
  try{
    const {ethereum} = window

    if (!ethereum) {
      alert("Please get Metamask first!")
      return
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" })

    console.log("Connected", accounts[0])
    setCurrentAccount(accounts[0])
  } catch (error) {
    console.log(error)
  }
}

// call wave function from website

const wave = async() => {
  try{
    const {ethereum} = window;
    if (ethereum){
      const provider = new ethers.providers.Web3Provider(ethereum);

      // ethers is a library that helps frontend to talk to our contract, import it using import{ethers} from "ethers"

      const signer = provider.getSigner();

      // provider is what we use to talk to ethereum nodes

      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

      // passes in the contract address, contactABI: allows client to read data from smart contract, and wallet signer
      // reading data is "free" (get request) and writing data needs to notify miners so txn can be mined (update request)
      // changing the blockchain requires miners

      let count = await wavePortalContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());

      const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        
        console.log("Retrieved total wave count...", count.toNumber());
    } else {
      console.log("Ethereum object does not exist!");
    }
  } catch (error) {
    console.log(error);
  }
}

  useEffect(() => {
    checkIfWallet();
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave} >
          Wave at Me
        </button>
        {!currentAccount && (
          <button className="walletButton" onClick={connectWallet}>
            Connect Metamask Wallet
          </button>
        )}
      </div>
    </div>
  );
}
