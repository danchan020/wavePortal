import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import './App.css';

export default function App() {
  
  const [currentAccount, setCurrentAccount] = useState("")
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const contractAddress = "0x51783e7515D6e86b0E56D446b1252195AbC79Bae"
  const contractABI = abi.abi
  
  //See if we can access the user's account
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
    setMessage("")

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

      const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
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

      const waves = await wavePortalContract.getAllWaves();

      let wavesCleaned = [];
      waves.forEach(wave => {
        wavesCleaned.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        });
      });

      setAllWaves(wavesCleaned);

      
      //   wavePortalContract.on("NewWave", (from, timestamp,message) => {
        //   console.log("NewWave", from, timestamp, message);
        //   setAllWaves(prevState => [...prevState,
        //     {
          //       address: from,
          //       timestamp: new Date(timestamp * 1000),
          //       message: message,
          //     }]);
          // })
          
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
    
    // Listen for emitter event 
    
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
        console.log("NewWave", from, timestamp, message);
        setAllWaves((prevState) => [
            ...prevState,
            {
                address: from,
                timestamp: new Date(timestamp * 1000),
                message: message,
            },
        ]);
    };

    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
        if (wavePortalContract) {
            wavePortalContract.off("NewWave", onNewWave);
        }
    };
}, []);

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋  Welcome to my WavePortal!
        </div>

        <div className="bio">
            <p> Hi, I'm Daniel and this is my first deployed Ethereum smart contract on Goerli testnet. </p>
            <p> Connect your Metamask wallet to the testnet network to send me a message and wave!</p>
        </div>

        {!currentAccount && (
          <button className="button" onClick={connectWallet}>
            Connect Metamask Wallet
          </button>
        )}
        { currentAccount ? (
        <div class="message-container">
          <textarea className="message-input"
          name="messageBox" 
          placeholder="Send me a message..." 
          type="text" 
          value={message}
          onChange={ e => setMessage(e.target.value)}/>
        </div>): null}

          <button className="button" onClick={wave}>
            Message and Wave
          </button>

        <div className="inform"> *there is a 1 minute cooldown per wave* </div>
        <div className="waveCount"> So far I have been waved at <span>{allWaves.length}</span> times </div>
          {allWaves.length > 0 ? 
            <div className="waves">
              {allWaves.map((wave, index) => {
                return (
                    <div key={index} className="wave-card">
                      <div className="wave-key">Address: {wave.address}</div>
                      <div className="wave-key">Message: {wave.message}</div>
                      <div className="wave-key">Time: {wave.timestamp.toString()}</div>
                  </div>)
              })}
            </div> : null}
      </div>
    </div>
  );
}
