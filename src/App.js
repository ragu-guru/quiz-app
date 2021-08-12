// import logo from './logo.svg';
import './App.scss';
import React from 'react';
import {
  BrowserRouter as Router, 
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import Login from './components/login/Login';
import Admin from './components/admin/Admin';
import Quiz from './components/quiz/Quiz';
import Results from './components/results/Results';
import Dashboard from './components/dashboard/Dashboard';
import { session, validateNRIC } from './assets/js/helpers'

// Compnent to direct the routes.
const PrivateRoute = ({ component: Component, sessionKey: key, redirectTo: pathname, ...rest }) => (
  <Route {...rest} render={(props) => (
    !!session.getSession(key).nric && validateNRIC(session.getSession(key).nric)
      ? <Component {...props} /> 
      : <Redirect to={{
          pathname,
          state: { from: props.location }
        }} />
  )} />
)

function App(props) {
  return (
    <div className="App">
      <Router>
        <Switch>
          <PrivateRoute path='/quiz' sessionKey='efg' redirectTo='/' component={Quiz} />
          <Route exact path="/">
            <Login />
          </Route>
          <Route path="/results">
            <Results />
          </Route>
          <PrivateRoute path='/admin/dashboard' sessionKey='efg-admin' redirectTo='/admin' component={Dashboard} />
          <Route path="/admin">
            <Admin />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
