import React, {useState} from 'react';
import {
    BrowserRouter as Router, 
    Switch,
    Route,
    NavLink
  } from 'react-router-dom'
import Attendees from '../attendees/Attendees';
import Schedule from '../schedule/Schedule';
import Users from '../users/Users';
import './Dashboard.scss';
import { validateNRIC, session } from '../../assets/js/helpers';
import { Redirect } from 'react-router-dom';

function Dashboard() {
    const [username, setUsername] = useState('Ragu');
    const logOut = () => {
        session.removeSession('efg-admin');
        setUsername('');
    };
    if (!username) {
        return <Redirect to={'/admin'} />
    }
    return (
        <Router>
            <div className="dashboard">
                <div className="dashboard__left">
                    <div>
                        <ul className="dashboard__nav">
                            <li>
                                <NavLink to="/admin/dashboard" activeClassName="active">Dashboard</NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/students">Students</NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/schedule">Schedule new class</NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/attendees">Assign Attendees</NavLink>
                            </li>
                            <li>
                                <button onClick={logOut}>Log Out</button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="dashboard__right">
                    {/*
                    A <Switch> looks through all its children <Route>
                    elements and renders the first one whose path
                    matches the current URL. Use a <Switch> any time
                    you have multiple routes, but you want only one
                    of them to render at a time
                    */}
                    <Switch>
                        <Route path="/admin/dashboard">
                            <>
                                <h2>Welcome to Dashboard of EFG!</h2>
                                <p>Please navigate through the menu items to do your desired task.</p>
                                <p className="error">Note: Be cautious as your making changes on production site.</p>
                            </>
                        </Route>
                        <Route path="/admin/students">
                            <Users />
                        </Route>
                        <Route path="/admin/attendees">
                            <Attendees />
                        </Route>
                        <Route path="/admin/schedule">
                            <Schedule />
                        </Route>
                    </Switch>
                </div>
            </div>
        </Router>
    )
}

export default Dashboard
