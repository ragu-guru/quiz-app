import React from 'react';
import './Results.scss';
import logo from '../../assets/images/efg.jpeg';
import axios from 'axios';
import dayjs from 'dayjs';
import DatePicker from "react-datepicker";


class Results extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startdate: new Date()
        }
    }
    handleSubmit = (e) => {
        e.preventDefault();
    }

    handleChange = (event, date) => {
        this.setState({
            startdate: date
        });
    }
    
    render() {
        return (
            <div className="results">
                <div className="login">
                    <div className="login__logo">
                        <img src={logo} alt="Efg Logo" />
                    </div>
                    <div className="login__form">
                        <form onSubmit={this.handleSubmit}>
                            <label>
                                Select your course:
                                <select>
                                    <option>CSOC</option>
                                </select>
                            </label>
                            <label>
                                Exam date:
                                <DatePicker selected={this.state.startdate} onChange={this.handleChange} />
                            </label>
                            <button type="submit"  className="login__button">Proceed</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default Results;

