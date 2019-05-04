import React, { Component } from 'react';
import './App.css';

class App extends Component {
  // Initialize state
  state = { value: '', matchHistory: [], loading: false, error: null }

  componentDidMount() {
    //this.getMatchHistory();
  }

  getMatchHistory = () => {
    this.setState({ loading: true, error: null });
    fetch(`/api/matchHistory?username=${this.state.value}`)
      .then(res => {
          if (res.ok) {
           return res.json()
          }
          throw res.statusText; 
        })
      .then(data => this.setState({ matchHistory: data.results, loading: false }))
      .catch(err => {
        this.setState({loading: false, error: err})
        console.log(err);
      });
  }

  handleSubmit = () => {
    this.getMatchHistory();
  }

  onChange = (event) => {
    this.setState({ value: event.target.value });
  }

  renderMatchHistory = () => {
    return this.state.matchHistory.map( match =>
      <div 
        key={match.gameId} 
        className={`match-container ${match.didWin ? 'victory-container' : 'defeat-container'}`}>
        { match.didWin ? (<div className="victory-font win-status">Victory</div>) : 
          (<div className="defeat-font win-status">Defeat</div>)
        }
        <div className="level">{ `Level ${match.championLevel }`}</div>
        <div className="duration">{ `${match.gameDuration}`}</div>
        <div className="summoner-name">{ `${match.summonerName} as `} <b>{ match.championName }</b> </div>
        <div className="kill-death">{ `KDA: ${match.kills}/${match.deaths}/${match.assists}` }</div>
        <div className="cs">{ `CS: ${match.creepScore} (${match.creepPerMin})` }</div>
        <div className="summonerSpells">{ `${match.summonerSpells[0]} & ${match.summonerSpells[1]}` }</div>
        <div className="items-header">Items</div>
        <div className="items">{ match.boughtItems.map( 
            item => <div key={`${match.gameId} ${item}`} className="item">{item}</div>
          )}
        </div>
      </div>
    )
  }

  render() {
    const { value, matchHistory, loading } = this.state;

    return (
      <div className="App">
        <h1>League Stats</h1>
        <input type="text" value={value} onChange={this.onChange} />
        <button onClick={this.handleSubmit} disabled={loading}> Submit </button>
        <div className="content-area">
        { loading && <div className="loader"></div> }
        { !loading && matchHistory && matchHistory.length > 0 && (this.renderMatchHistory()) }
        </div>
      </div>
    );
  }
}

export default App;