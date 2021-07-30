import React, { useState, useRef, useEffect } from 'react';
import logo from '../../assets/images/efg.jpeg';
// Importing the login css since we have a login box style for form.
import "../login/Login.scss";
import { validateNRIC, session } from '../../assets/js/helpers';
import { Redirect } from 'react-router-dom';

function Admin() {
    const [ input, setInput ] = useState('');
    const [ error, setError ] = useState('');
    const [redirectToReferrer, setRedirectToReferrer] = useState(false);
    const inputRef = useRef();
    const handleSubmit = (e) => {
        e.preventDefault();
        if(!validateNRIC(input)) {
            setError(`Please enter a valid IC number`);
            inputRef.current.focus();
            return;
        }

        let data = {
            nric: 'G5439445X'
        };

        if(input === 'G5439445X') {
            session.setSession('efg-admin', data);
            setRedirectToReferrer(true);
        }
    }

    const handleChange = (event) => {
        setInput(event.target.value);
    }

    useEffect(()=> {
        if (!!session.getSession('efg-admin').nric && validateNRIC(session.getSession('efg-admin').nric)) {
            setRedirectToReferrer(true);
        }
    },[])

    return (
        <>
        {
        redirectToReferrer 
            ?
            <Redirect to={'/admin/dashboard'} />
            : 
            <div className="login">
                <div className="login__logo">
                    <img src={logo} alt="Efg Logo" />
                </div>
                <div className="login__form">
                    <form onSubmit={handleSubmit}>
                        <label>
                            Enter your NRIC / FIN:
                            <input type="text" className="login__input" ref={inputRef} value={input} onChange={handleChange} placeholder="GXXXXXXXX" />
                            <span className="login__error error">{error}</span>
                        </label>
                        <button type="submit"  className="login__button">Proceed</button>
                    </form>
                </div>
            </div>
        }
        </>
    )
}

export default Admin;