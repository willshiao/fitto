import React from 'react';
import './App.css';
import Home from './components/Home';
import Session from './components/Session';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/session" component={Session} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
