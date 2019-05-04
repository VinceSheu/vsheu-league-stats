import React, { Component } from 'react';
import './App.css';

class App extends Component {
  // Initialize state
  state = { matchHistory: [] }

  componentDidMount() {
    this.getMatchHistory();
  }

  getMatchHistory = () => {
    fetch(`/api/matchHistory`)
      .then(res => {
          if (res.ok) {
           return res.json()
          }
          throw res.statusText; 
        })
      .then(data => this.setState({ matchHistory: data }))
  }

  render() {

    return (
      <div className="App">
      </div>
    );
  }
}

export default App;