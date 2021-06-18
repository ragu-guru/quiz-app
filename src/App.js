// import logo from './logo.svg';
import './App.scss';
import React, { useState } from 'react';
import {
  BrowserRouter as Router, 
  Switch,
  Link,
  Route,
  Redirect,
  withRouter
} from 'react-router-dom'
import Login from './components/login/Login';
import Quiz from './components/quiz/Quiz';
import {fakeAuth, session} from './assets/js/helpers'


const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    fakeAuth.isAuthenticated === true
      ? <Component {...props} />
      : <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }} />
  )} />
)

export const UserContext = React.createContext();

function App(props) {
  return (
    <div className="App">
      <Router>
        <Switch>
          <PrivateRoute path='/quiz' component={Quiz} />
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
