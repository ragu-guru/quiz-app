import React from 'react';
import './Login.scss';
import logo from '../../assets/images/efg.jpeg';
import axios from 'axios';
import { validateNRIC, session } from '../../assets/js/helpers'
import { Redirect } from 'react-router-dom'

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            error: '',
            redirectToReferrer: false
        }
        this.inputRef = React.createRef();
    }
    handleSubmit = (e) => {
        e.preventDefault();
        if(!validateNRIC(this.state.value)) {
            this.setState({error: `Please enter a valid IC number`});
            this.inputRef.current.focus();
            return;
        }
        axios.get(`/apis/user`)
        .then(res => {
            const persons = res.data;
            if (persons.IC === this.state.value) {
                session.setSession('efg', persons);
                this.setState({redirectToReferrer: true});
            } else {
                this.setState({error: `Oops! Something wrong!! Please contact the trainer!`});
            }
        });
    }

    handleChange = (event) => {
        this.setState({
            value: event.target.value,
            error: ''
        });
    }

    componentDidMount() {
        if (!!session.getSession('efg').IC && validateNRIC(session.getSession('efg').IC)) {
            this.setState({redirectToReferrer: true});
        }
    }
    
    render() {
        const { redirectToReferrer } = this.state;
    
        if (redirectToReferrer === true) {
            return <Redirect to={'/quiz'} />
        }
    
        return (
            <div className="login">
                <div className="login__logo">
                    <img src={logo} alt="Efg Logo" />
                </div>
                <div className="login__form">
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            Enter your NRIC / FIN:
                            <input type="text" className="login__input" value={this.state.value} onChange={this.handleChange} placeholder="GXXXXXXXX" ref={this.inputRef} />
                            <span className="login__error">{this.state.error}</span>
                        </label>
                        <button type="submit"  className="login__button">Proceed</button>
                    </form>
                </div>
            </div>
        )
    }
}

export default Login;

