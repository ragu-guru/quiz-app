import React, {useEffect, useState} from 'react';
import './Login.scss';
import logo from '../../assets/images/efg.jpeg';
import axios from 'axios';
import {fakeAuth, validateNRIC, session} from '../../assets/js/helpers'

import {
    BrowserRouter as Router, 
    Switch,
    Link,
    Route,
    Redirect,
    withRouter
} from 'react-router-dom'



export default function Login() {
    const [FIN, setFIN] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [username, setUsername] = useState('');
    const [redirectToReferrer, setredirectToReferrer] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        if(!validateNRIC(FIN)) {
            setErrorMsg(`Please enter a valid IC number`);
            return;
        }

        axios.get(`/apis/user`)
        .then(res => {
            const persons = res.data;
            fakeAuth.authenticate(()=>{
                session.setSession('efg-username', persons.name);
                setredirectToReferrer(true);
            })
            
        })
    }

    // useEffect(()=>{
    //     console.log('running use effect');
    //     if (session.getSession('efg-username')) {
    //         console.log('got session');
    //         setredirectToReferrer(true);
    //     }
    // }, []);

    const handleChange = (event) => {
        setFIN(event.target.value);
        setErrorMsg('');
    }

    return (
        <>
        {/* {(redirectToReferrer === true) && (<Redirect to='/quiz' />)} */}
        <div className="login">
            <div className="login__logo">
                <img src={logo} alt="Efg Logo" />
            </div>
            <div className="login__form">
                <form onSubmit={handleSubmit}>
                    <label>
                        Enter your NRIC / FIN:
                        <input type="text" className="login__input" value={FIN} onChange={handleChange} placeholder="GXXXXXXXX" />
                        <span className="login__error">{errorMsg}</span>
                    </label>
                    <button type="submit" className="login__button">Proceed</button>
                </form>
            </div>
        </div>
        </>
    );
}


