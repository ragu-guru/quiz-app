import React from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import './Quiz.scss';
import ProgressBar from '../progress-bar/ProgressBar';
import { session, validateNRIC, calculateTimeLeft } from '../../assets/js/helpers';
import userIcon from '../../assets/images/user-icon.svg';
import { Redirect } from 'react-router-dom';
import Countdown from '../countdown/Countdown';

class Quiz extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: session.getSession('efg').name,
            showInstruction: true, // This is to show instruction page before quiz.
            questionIndex: 0, // The component will load the question based on this value. Initial value is set to 0 to match the array index.
            isLoading: true, // This is to findout whether the data fetching is still on progress. Based on this value, we will show loading gif or message.
            validationFailed: false, // Intially this will be set to false. Upon clicking event handler, we will update this value. Based on this value, the error message will be shown.
            questions: [], // Container array where the questions data from api call will be stored.
            noOfQuestionsAnswered: 0,
            examDuration: session.getSession('efg').duration,
            examStartTime: session.getSession('efg').startTime,
            countdownToStartExam: false,
            endExam: false,
            showQuiz: false,
            examEndTime: 3600000, // 1 hour in milliseconds.
            otherErrors: false
        };
        console.log(session.getSession('efg'))
    }


    // Proceed handler.
    handleProceed = () => {
        let timeLeftToStartExam = calculateTimeLeft(this.state.examStartTime);
        if(timeLeftToStartExam) {
            this.setState({
                countdownToStartExam: true
            })
            setTimeout(() => {
                this.setState({
                    showInstruction: false,
                    showQuiz: true
                })
            }, timeLeftToStartExam.totalTimeLeftInSec)
        } else {
            this.setState({
                showInstruction: false,
                showQuiz: true
            })
        }
    }

    logOut = () => {
        session.removeSession('efg');
        this.setState({userName: false});
    }

    // onChange handler for radio buttons. Basically used to remove the validation error message.
    handleChange = (event) => {
        const { noOfQuestionsAnswered, questions, questionIndex } = this.state;
        if (noOfQuestionsAnswered === questions.length) {
            questions[questionIndex].answer = this.getSelectedOption();
            this.setState({questions: questions});
        }
        this.setState({
            validationFailed: false
        });
    }

    getSelectedOption = () => {
        // Validate the radio buttons and update the state to show error message.
        let selectedOption = document.querySelector('form input[type="radio"]:checked');
        return selectedOption ? selectedOption.value : false;
    }

    // onClick handler for quiz buttons. Basically to show next/prev questions.
    handleQuestion = (event, direction = 'next') => {
        event.preventDefault();

        // Fallback to original state to hide the validation error message.
        this.setState({
            validationFailed: false
        });

        // Validate the radio buttons and update the state to show error message.
        if (!this.getSelectedOption() && direction === 'next') {
            this.setState({
                validationFailed: true
            })
            return;
        }

        // Destructure the state.
        const {questions, questionIndex} = this.state;

        // Update the state with the selected answer.
        if (direction === 'next') {
            if (!questions[questionIndex].hasOwnProperty('answer')) {
                this.setState({noOfQuestionsAnswered: this.state.noOfQuestionsAnswered + 1})
            }
            questions[questionIndex].answer = this.getSelectedOption();
            this.setState({questions: questions});

            // Return when all the questions are answered.
            if (this.state.questionIndex === questions.length - 1) {
                return;
            }
        }

        // Update the questionIndex to navigate between the questions. The callback function is used to updated the checked status based on previously selected answer.
        this.setState({
            questionIndex: direction === 'next' ? questionIndex + 1 : questionIndex - 1
        }, () => {
            let ans = questions[this.state.questionIndex].answer;
            if (ans) {
                document.querySelector(`form input[type="radio"][value=${ans}]`).checked = true;
            }
        });

        // Reset the radio button focus.
        this.radioRef.current.reset();
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let answers = this.state.questions.map(question => question.answer);

        const IC = session.getSession('efg').IC;
        if (!IC || !validateNRIC(IC)) {
            console.log('Something went wrong');
            return;
        }
        let data = {
            IC,
            answers
        }
        axios.post("/apis/questions", data).then(res => {
            console.log(res);
        });
    }

    // Fetch api data. We are using axios to get the data.
    componentDidMount() {
        let examEndTime = dayjs(this.state.examStartTime).add(this.state.examDuration, 'm');
        if( examEndTime.diff(dayjs()) < 300000 ) {
            this.setState({
                otherErrors: true
            })
            return;
        } else {
            this.setState({
                examEndTime 
            })
        }
        axios.get("/apis/questions").then(response => {
            this.setState({ questions: response.data }); // Update the questions property in the state object.
            this.setState({ isLoading: false }); // Update isLoading property in state  object.
        });

        // Since we're re-using the same form across questions,
        // create a ref to it so we can clear its state after a question is answered.
        this.radioRef = React.createRef();

        window.onbeforeunload = (event) => {
            const e = event || window.event;
            // Cancel the event
            e.preventDefault();
            if (e) {
              e.returnValue = ''; // Legacy method for cross browser support
            }
            return ''; // Legacy method for cross browser support
        };
    }

    componentDidUpdate() {
        if(this.state.showQuiz) {
            let duration = this.state.examEndTime.diff(dayjs());
            setTimeout(() => {
                let submitBtn = document.querySelector(".quiz__submit");
                submitBtn.disabled = false;
                submitBtn.click();
            }, duration)
        }
    }

    render() {
        const { userName, countdownToStartExam, showQuiz, examDuration, examStartTime, showInstruction, isLoading, questionIndex, questions, noOfQuestionsAnswered, validationFailed, endExam, examEndTime, otherErrors } = this.state;
        if (!userName) {
            return <Redirect to={'/'} />
        }

        if (otherErrors) {
            return <div>Something wrong! Looks like your exam is already over. Please contact your trainer.</div>
        }

        // Show quiz.
        if (isLoading) {
            return <div className="App">Loading...</div>;
        }
        
        let { id, question, options, image } = questions[questionIndex];
        
        
        return (
            <div className="quiz">
                <div className="quiz__userSection">
                    Hi 
                    <span className="quiz__username">
                        {userName}
                        <img width="20" src={userIcon} alt="user" />
                        <span className="quiz__logout" onClick={this.logOut}>Log Out</span>
                    </span>
                </div>
                {showQuiz && <Countdown endTime={examEndTime} />}
                <div className="quiz__wrapper">

                    {/* Show instruction based on the state value. */}
                    {showInstruction
                        ? 
                        <div className="quiz__instructions">
                            <h1>Instructions about this exam</h1>
                            <p>Quiz instructions goes here</p>
                            <ul>
                                <li>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                </li>
                                <li>
                                    Donec sed massa sit amet neque vulputate egestas.
                                </li>
                                <li>
                                    Fusce congue felis tristique nulla ullamcorper congue.
                                </li>
                            </ul>
                            {countdownToStartExam 
                                ? <Countdown endTime={examStartTime} text="Please wait. Your exam will start in" />
                                : <button type="button" onClick={this.handleProceed}>Proceed</button>
                            }

                        </div>
                        : 
                        <div className="quiz__questions">
                            {/* // Show progress bar */}
                            <ProgressBar noOfQuestionsAnswered={noOfQuestionsAnswered} questionLength={questions.length} />

                            {/* // Show Questions */}
                            <form id="quiz__form" onSubmit={this.handleSubmit} ref={this.radioRef}>
                                <div className="quiz__imgContainer">
                                    {image && <img src="https://via.placeholder.com/450x300.jpg" alt="Diagram" />}
                                </div>
                                <h2>
                                    {id} . {question}
                                </h2>
                                {Object.keys(options).map((key) => (
                                    <label key={key} className="quiz__input">
                                        <input type="radio" name={id} value={key} onChange={this.handleChange} />
                                        <span>{options[key]}</span>
                                    </label>
                                ))}

                                {/* Error message. */}
                                {validationFailed && (
                                    <span className="error">Please select one option</span>
                                )}

                                {/* Prev button */}
                                <button className="quiz__arrow-btn" disabled={questionIndex === 0 && true} onClick={(e) => this.handleQuestion(e, 'prev')}><span className="efg-btn-arrow reverse"></span>Prev</button>
                                
                                {/* Next button */}
                                <button className="quiz__arrow-btn" disabled={(questionIndex + 1 === questions.length && noOfQuestionsAnswered === questions.length) && true} onClick={(e) => this.handleQuestion(e, 'next')}>Next<span className="efg-btn-arrow"></span></button>

                                {/* Submit button */}
                                <button type="submit" className="quiz__submit" disabled={(noOfQuestionsAnswered !== questions.length || endExam) && true} >Finished!</button>
                            </form>
                        </div>
                    }
                </div>
            </div>
        )
    }
}

export default Quiz;
