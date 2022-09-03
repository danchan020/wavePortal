import React, { useEffect, useState } from "react";
// import { ethers } from "ethers";
import './App.css';

export default function App() {

 //See if we can access the user's account
 
  const [currentAccount, setCurrentAccount] = useState("")

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

        <button className="waveButton" >
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
