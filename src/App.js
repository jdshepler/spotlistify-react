import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Authentication from './components/Authentication';
import './App.css';

function App() {
  return (
    <div className="App">
        <Switch>
            <Route path='/' exact component={Authentication} />
            <Route path='/sign-in' component={SignIn} />
        </Switch>
    </div>
  );
}

export default App;
