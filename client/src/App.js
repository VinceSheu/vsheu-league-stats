import React, { Component } from 'react';
import './App.css';
import XRegExp from 'xregexp';

class App extends Component {
  // Initialize state
  state = { value: '', matchHistory: [], loading: false, error: null }

  componentDidMount() {
    
  }

  getMatchHistory = () => {
    this.setState({ matchHistory: [], loading: true, error: null });
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
    const value = event.target.value;
    const regex = XRegExp('^[0-9\\pL _\\.]+$', 'gi');
    let newInputError = null;
    if (value !== '' && !regex.test(value)) {
      newInputError = 'Input contains forbidden characters.';
    }
    this.setState({ value, error: newInputError });
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
    const { value, matchHistory, loading, error } = this.state;

    return (
      <div className="App">
        <h1>League Stats</h1>
        <input type="text"
              className="input-field" 
              value={value} 
              placeholder="Enter a summoner name" 
              onChange={this.onChange} 
        />
        <button onClick={this.handleSubmit} disabled={loading || error }> Submit </button>
        {error && <div className="error">{error}</div>}
        <div className="content-area">
        { loading && <div className="loader"></div> }
        { !loading && matchHistory && matchHistory.length > 0 && (
          <div>
            <h3>These are <b>{value}</b>'s last 10 matches:</h3>
            {this.renderMatchHistory()}
          </div>
        ) }
        </div>
      </div>
    );
  }
}

export default App;