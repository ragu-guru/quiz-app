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
import Quiz from './components/quiz/Quiz';
import { session, validateNRIC } from './assets/js/helpers'

// Compnent to direct the routes.
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    !!session.getSession('efg').nric && validateNRIC(session.getSession('efg').nric)
      ? <Component {...props} /> 
      : <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }} />
  )} />
)

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
