import { useState } from 'react'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking'
import { DIDDataStore } from '@glazed/did-datastore'
import { DIDSession } from '@glazed/did-session'
import { MetaMaskInpageProvider } from "@metamask/providers";

import icon from './icon.png';
import './App.css';

declare global {
  interface Window{
    ethereum?:MetaMaskInpageProvider
  }
}

const PAGES_KEY = 'pages'



// create a new CeramicClient instance:
const ceramic = new CeramicClient("https://ceramic-clay.3boxlabs.com")

// reference the data models this application will use:
const aliases = {
    schemas: {
        basicProfile: 'ceramic://k3y52l7qbv1frxt706gqfzmq6cbqdkptzk8uudaryhlkf6ly9vx21hqu4r6k1jqio',

     },
    definitions: {
        BasicProfile: 'kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic',
     },
    tiles: {},
 }

// configure the datastore to use the ceramic instance and data models referenced above:
const datastore = new DIDDataStore({ ceramic, model: aliases })


// this function authenticates the user using SIWE
async function authenticateWithEthereum(ethereumProvider: any) {

    const accounts = await ethereumProvider.request({
    method: 'eth_requestAccounts',
    })

    const authProvider = new EthereumAuthProvider(ethereumProvider, accounts[0])

    const session = new DIDSession({ authProvider })

    const did = await session.authorize()

    ceramic.did = did
    console.log({ did, session, authProvider })
}

async function auth() {
  if (window.ethereum == null) {
    throw new Error('No ethereum provider found')
  }
  await authenticateWithEthereum(window.ethereum)
}



async function pushToCeramic() {

}


function App() {
  const [inputProfileDetails, setInputProfileDetails] = useState({
    name: '',
    gender: '',
    country: ''
  })

  const [ceramicProfileDetails, setCeramicProfileDetails] = useState({
    name: '',
    gender: '',
    country: ''
  })
  const [submitButton, setSubmitButton] = useState('Submit')
  const [walletButton, setWalletButton] = useState('Connect')


async function connectWallet(authFunction: () => void) {
  try {
    setWalletButton('Connecting...')
    await authFunction()
    setWalletButton('Connected')
  } catch (error) {
    console.log(error)
  }
}

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    await updateCeramic() 
  }

  const updateCeramic = async () => {
    console.log('handleSubmit')
    try {
      setSubmitButton('Updating...')
      console.log({inputProfileDetails})
      await datastore.merge('BasicProfile', inputProfileDetails)

      console.log({datastore})

      const profile = await datastore.get('BasicProfile')

      setCeramicProfileDetails(profile)

      setSubmitButton('Submit')
  } catch (error) {
    console.log(error)
  }
  }


  return(
    <div className="App">
      <header className="App-header">
        <button style={{width: '100px', height: '20px'}}onClick={() => connectWallet(auth)}>{walletButton}</button>
        <img src={icon} className="App-logo" alt="logo" />
        
    <div className="MainCont">
        <div className="DataBlocks">
            <div className="DataBlock">
                <div id="basicProfile">
                    <div className="BodyContainer">
                        <h2>Basic Profile</h2>
                        <p>Read from Ethereal Datamodel</p>
                        <br></br>
                        <p className="ProfileData" id="profileName">{ceramicProfileDetails.name}</p>
                        <p className="ProfileData" id="profileGender">{ceramicProfileDetails.gender}</p>
                        <p className="ProfileData" id="profileCountry">{ceramicProfileDetails.country}</p>
                    </div>
                </div>
            </div>
        </div>
        <div className="ProfileForm">
            <div className="BodyContainer">
                <h2>Update Basic Profile on Ethereal</h2>
                <br></br>
                <form onSubmit={handleSubmit}>
                    <div className="formfield">
                        <label className="formLabel" >Name:</label>
                        <input value={inputProfileDetails.name} onChange={(e) => setInputProfileDetails({...inputProfileDetails, name: e.target.value})}className="forminput" id="name" placeholder="John Doe"></input>
                    </div>
                    <div className="formfield">
                        <label className="formLabel" >Country:</label>
                        <input value={inputProfileDetails.country} onChange={(e) => setInputProfileDetails({...inputProfileDetails, country: e.target.value})}className="forminput" type="text" id="country" placeholder="USA"></input>
                    </div>
                    <div className="formfield">
                        <label className="formLabel" >Gender:</label>
                        <select value={inputProfileDetails.gender} onChange={(e) => setInputProfileDetails({...inputProfileDetails, gender: e.target.value})}className="forminput" id="gender">
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="non-binary">Non-Binary</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="formfield">
                        <input className="forminput" type="submit" id="submitBtn" value={submitButton}></input>
                    </div>
                </form>
            </div>
        </div>
    </div>
      </header>
    </div>
  );
}

export default App;
