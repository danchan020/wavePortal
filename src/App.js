import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import './App.css';

export default function App() {

 //See if we can access the user's account
 
  const [currentAccount, setCurrentAccount] = useState("")
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0xD617Ec184Ff1769663512F041604A51D4A0d2108"
  const contractABI = abi.abi

  const checkIfWallet = async() => {
    try{
      const { ethereum } = window

      if (ethereum){
        console.log("We have the ethereum object", ethereum)
      } else {
        console.log( "Make sure you have a metamask wallet!")
      }

      //special method to access account in user wallet (eth_accounts)
  const accounts = await ethereum.request({ method: "eth_accounts" })


  if (accounts.length !== 0) {
    const account = accounts[0];
    console.log("Found an authorized account:", account);
    setCurrentAccount(account)
    getAllWaves()
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

const getAllWaves = async () => {
  try {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

      /*
       * Call the getAllWaves method from your Smart Contract
       */
      const waves = await wavePortalContract.getAllWaves();

      /*
       * We only need address, timestamp, and message in our UI so let's
       * pick those out
       */
      let wavesCleaned = [];
      waves.forEach(wave => {
        wavesCleaned.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        });
      });

      /*
       * Store our data in React State
       */
      setAllWaves(wavesCleaned);
    } else {
      console.log("Ethereum object doesn't exist!")
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
          👋  Welcome to my WavePortal!
        </div>

        <div className="bio">
            <p> Hi, my name is Daniel and this is my first deployed Ethereum smart contract. </p>
            <p> Connect your Metamask wallet and give me a wave!</p>
        </div>

        {!currentAccount && (
          <button className="button" onClick={connectWallet}>
            Connect Metamask Wallet
          </button>
        )}
        <button className="button" onClick={wave} >
          Wave at Me
        </button>
        <div className="waveCount"> So far I have been waved at {allWaves.length} times </div>
        {/* {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })} */}
      </div>
    </div>
  );
}
