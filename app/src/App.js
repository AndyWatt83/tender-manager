import React, { Component } from "react";
import { DrizzleProvider } from "drizzle-react";
import { LoadingContainer } from "drizzle-react-components";

import TenderManager from "./contracts/TenderManager.json";
import truffleContract from "truffle-contract";
import getWeb3 from "./getWeb3";
import ipfs from './ipfs';

import "./App.css";

import drizzleOptions from "./drizzleOptions";
import MyContainer from "./MyContainer";

class App extends Component {

    constructor(props)
    {
        super(props)
        this.state = {
            web3: null,
            accounts: null,
            contract: null,
            ipfsHash: null,
            formIPFS: "",
            formAddress: "",
            receivedIPFS: "",
            test: ""
        };

        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.handleChangeIPFS = this.handleChangeIPFS.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.handleReceiveIPFS = this.handleReceiveIPFS.bind(this);
    }

    componentDidMount = async () =>
    {
        try
        {
            // // Get network provider and web3 instance.
            const web3 = await getWeb3();

            // // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();

            // // Get the contract instance.
            const Contract = truffleContract(TenderManager);
            Contract.setProvider(web3.currentProvider);
            const instance = await Contract.deployed();

            // instance.ClientRegistered()
            //     .on('data', result => {
            //         this.setState({receivedIPFS: result.args[0]});
            //         console.log('inboxResponse handler');
            //         console.log(result.args[0]);
            //     });

            // // Set web3, accounts, and contract to the state, and then proceed with an
            // // example of interacting with the contract's methods.
            console.log(web3);
            console.log(accounts);
            console.log(instance);
            this.setState({ web3, accounts, contract: instance });
            // //this.setEventListeners();
        }
        catch (error)
        {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
                );
                console.error(error);
        }
    };

    handleChangeAddress(event)
    {
        console.log('handleChangeAddress');
        this.setState({formAddress: event.target.value});
    }

    handleChangeIPFS(event)
    {
        console.log('handleChangeIPFS');
        this.setState({formIPFS: event.target.value});
    }

    handleSend(event)
    {
        console.log('handleSend');
        event.preventDefault();
        const contract = this.state.contract
        const account = this.state.accounts[0]

        document.getElementById('new-notification-form').reset()
        this.setState({showNotification: true});
        contract.sendIPFS(this.state.formAddress, this.state.formIPFS, {from: account})
            .then(result => {
                this.setState({formAddress: ""});
                this.setState({formIPFS: ""});
            })
    }

    handleReceiveIPFS(event)
    {
        console.log('handleReceiveIPFS');
        event.preventDefault();
        // const contract = this.state.contract;
        // const account = this.state.accounts[0];
        // contract.checkInbox({from: account});
    }

    captureFile = (event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)
    };

    convertToBuffer = async(reader) => {
        //file is converted to a buffer for upload to IPFS
        const buffer = await Buffer.from(reader.result);
        console.log(buffer);
        //set this buffer -using es6 syntax
        this.setState({buffer});
    };

    onIPFSSubmit = async (event) => {
        event.preventDefault();

        //bring in user's metamask account address
        const accounts = this.state.accounts;

        console.log('Sending from Metamask account: ' + accounts[0]);

        //save document to IPFS,return its hash#, and set hash# to state
        //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add

        await ipfs.add(this.state.buffer, (err, ipfsHash) => {
            console.log(err,ipfsHash);
            //setState by setting ipfsHash to ipfsHash[0].hash
            this.setState({ ipfsHash:ipfsHash[0].hash });

        })
    };

    render() {
        if (!this.state.web3)
        {
            return <div>Loading Web3, accounts, and contract...</div>;
        }

        return (
            <div>
                <div className="App">
                    <h2> 1. Add a file to IPFS here </h2>
                    <form id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit}>
                        <input type = "file" onChange={this.captureFile} />
                        <button type="submit">Send it</button>
                    </form>
                    <p> The IPFS hash is: {this.state.ipfsHash}</p>
                    <h2> 2. Send notifications here </h2>
                    <form id="new-notification-form" className="scep-form" onSubmit={this.handleSend}>
                    <label>
                        Receiver Address:
                        <input type="text" value={this.state.value} onChange={this.handleChangeAddress} />
                    </label>
                    <label>
                        IPFS Address:
                        <input type="text" value={this.state.value} onChange={this.handleChangeIPFS} />
                    </label>
                    <input type="submit" value="Submit" />
                    </form>
                    <h2> 3. Receive Notifications </h2>
                    <button onClick={this.handleReceiveIPFS}>Receive IPFS</button>
                    <p>{this.state.receivedIPFS}</p>
                </div>
                {/* <DrizzleProvider options={drizzleOptions}>
                    <LoadingContainer>
                        <MyContainer />
                    </LoadingContainer>
                </DrizzleProvider> */}
            </div>
            );
        }
    }

    export default App;