import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import _ from 'lodash'


const ETHEREUM_PROVIDER = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const BALLOT_ADDRESS = '0xc5d6965a2aff480d0000d0160fcab89fe86403a6';
const BALLOT_ABI = [{"constant":false,"inputs":[{"name":"prop","type":"uint256"}],"name":"vote","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"proposals","outputs":[{"name":"name","type":"bytes32"},{"name":"voteCount","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"chairperson","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"winningProposal","outputs":[{"name":"winningProp","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"voters","outputs":[{"name":"weight","type":"uint256"},{"name":"voted","type":"bool"},{"name":"delegate","type":"address"},{"name":"vote","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"returnWinner","outputs":[{"name":"winnerName","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getTotalCurrentVotes","outputs":[{"name":"totalCurrentVotes","type":"uint256[]"},{"name":"ballotNameTotals","type":"bytes32[]"}],"payable":false,"type":"function"},{"inputs":[{"name":"proposalNames","type":"bytes32[]"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"voter","type":"address"},{"indexed":false,"name":"proposal","type":"uint256"},{"indexed":false,"name":"dateCasted","type":"uint256"}],"name":"voteCasted","type":"event"}]
const BALLOT = ETHEREUM_PROVIDER.eth.contract(BALLOT_ABI).at(BALLOT_ADDRESS);
const coinbase = ETHEREUM_PROVIDER.eth.coinbase;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isButtonDisabled: false,
      candidateNames: [],
      candidateAggregateVotes: []
    }
  }

  componentDidMount() {

    let initBallotAggregates = BALLOT.getTotalCurrentVotes()[0]
    let initBallotNames = BALLOT.getTotalCurrentVotes()[1];

    this.setState({
      candidateNames: initBallotNames,
      candidateAggregateVotes: initBallotAggregates
    })

    this._broadcastVote()

  }

  // calls event from contract
  _broadcastVote() {
    BALLOT.voteCasted({ fromBlock: ETHEREUM_PROVIDER.eth.currentBlock, toBlock: 'latest' }).watch((err, res) => {
      console.log(res.args);
    })
  }

  _vote(proposalIndex) {
    console.log('voted', proposalIndex + 1);
    this.setState({
      isButtonDisabled: true
    });
    // BALLOT.vote(proposalIndex, {from: coinbase, gas: 2100000}, (err, res) => {
    //   console.log(res);
    //   console.log(err);
    // })
  }


  render() {

    let disabled = this.state.isButtonDisabled ? 'disabled' : '';
    // creates empty array to push JSX from state
    let candidates = [];
    let candidateVotes = [];
    // pushes values of candidate
    _.each(this.state.candidateNames, (value, index) => {
      candidates.push(
        <div key={index}>
          <h1>{ETHEREUM_PROVIDER.toAscii(value)}</h1>
          <h2>{this.state.candidateAggregateVotes[index].toString(10)}</h2>
          <button onClick={()=>{this._vote(index)}} disabled={this.state.isButtonDisabled} >Vote</button>
        </div>
      )
    })


    return (
      <div className="App">
        <h1 className="title">Candidates</h1>
        <div className="candidates">
          {candidates}
        </div>
        <div className="candidates">
          {candidateVotes}
        </div>
      </div>
    );
  }
}

export default App;
