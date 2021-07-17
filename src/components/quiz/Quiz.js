import React from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import './Quiz.scss';
import ProgressBar from '../progress-bar/ProgressBar';
import { session, validateNRIC, calculateTimeLeft } from '../../assets/js/helpers';
import userIcon from '../../assets/images/user-icon.svg';
import { Redirect } from 'react-router-dom';
import Countdown from '../countdown/Countdown';
import logo from '../../assets/images/efg.jpeg';

class Quiz extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: session.getSession('efg').name,
            userID: session.getSession('efg').nric,
            courseName: session.getSession('efg').course,
            showInstruction: true, // This is to show instruction page before quiz.
            questionIndex: 0, // The component will load the question based on this value. Initial value is set to 0 to match the array index.
            isLoading: true, // This is to findout whether the data fetching is still on progress. Based on this value, we will show loading gif or message.
            validationFailed: false, // Intially this will be set to false. Upon clicking event handler, we will update this value. Based on this value, the error message will be shown.
            questions: [], // Container array where the questions data from api call will be stored.
            noOfQuestionsAnswered: 0,
            examDuration: session.getSession('efg').duration,
            examStartTime: session.getSession('efg').date,
            countdownToStartExam: false,
            endExam: false,
            showQuiz: false,
            examEndTime: 3600000, // 1 hour in milliseconds.
            otherErrors: false,
            marksPercentage: 0,
            result: session.getSession('efg').result
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
        let answers = this.state.questions.map(question => ({quesId: question.id, ans: question.answer}));

        const id = this.state.userID;
        if (!id || !validateNRIC(id)) {
            console.log('Something went wrong');
            return;
        }
        let data = {
            id,
            answers
        }

        console.log(data);
        axios.get(process.env.REACT_APP_EXAM_RESULT_API, {
            params: data
        }).then(res => {
            let resData = res.data;
            console.log(resData);
            this.setState({
                result: res.data["result"],
                marksPercentage: res.data["marks"],
                showQuiz: false
            })
        });
    }

    // Fetch api data. We are using axios to get the data.
    componentDidMount() {
        let examEndTime = dayjs(this.state.examStartTime).add(this.state.examDuration, 'm');
        if( examEndTime.diff(dayjs()) < 0 ) {
            this.setState({
                otherErrors: true
            })
            return;
        } else {
            this.setState({
                examEndTime 
            })
        }
        axios.get(process.env.REACT_APP_QUESTIONS_API, {
            params: {
                id: this.state.userID
            }
        }).then(response => {
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
        const { userName, courseName, countdownToStartExam, showQuiz, examStartTime, examDuration, showInstruction, isLoading, questionIndex, questions, noOfQuestionsAnswered, validationFailed, endExam, examEndTime, otherErrors, marksPercentage, result } = this.state;
        if (!userName) {
            return <Redirect to={'/'} />
        }

        if (otherErrors) {
            return <div className="App">Something wrong! Looks like your exam is already over. Please contact your trainer.</div>
        }

        // Show quiz.
        if (isLoading) {
            return <div className="App">Loading...</div>;
        }
        
        // Destructure question, id, question options and question image.
        let { id, question, options, image } = questions[questionIndex];
        
        
        return (
            <div className="quiz">
                <div className="quiz__userSection">
                    <div className="quiz__logo">
                        <img src={logo} alt="Efg Logo" />
                    </div>
                    <div>
                        <div className="quiz__userDetails">
                            Hi 
                            <span className="quiz__username">
                                {userName}
                                <img width="20" src={userIcon} alt="user" />
                                <span className="quiz__logout" onClick={this.logOut}>Log Out</span>
                            </span>
                        </div>
                        { showQuiz && <Countdown text="Time left: " endTime={examEndTime} />}

                    </div>
                </div>
                <div className="quiz__wrapper">

                    {/* Show instruction based on the state value. */}
                    {showInstruction
                        ? 
                        <div className="quiz__instructions">
                            <h1>Course Name: {courseName}</h1>
                            <p><strong>Start Time</strong>: {examStartTime}</p>
                            <p><strong>Duration</strong>: {examDuration} minutes</p>

                            <h3>Instructions for the exam:</h3>
                            <p>Please read the below instructions carefully before proceeding with the exam. For any queries, please contact your trainer immediately.</p>
                            <ul>
                                <li>
                                    The exam has a strict cut off time and it will automatically end when times out.
                                </li>
                                <li>
                                    Please answer every question to proceed to next question. You can use the 'previous' and 'next' buttons to navigate throught the questions. 
                                </li>
                                <li>
                                    Do not refresh the page while the exam is in progress. This will remove all your selected and answers and you might have to redo everything.
                                </li>
                            </ul>
                            {countdownToStartExam 
                                ? <Countdown endTime={examStartTime} text="Please wait. Your exam will start in" />
                                : <button type="button" onClick={this.handleProceed}>Proceed</button>
                            }

                        </div>
                        : 
                        <div className="quiz__questions">
                            {result
                                ? 
                                    <>
                                        <h2>Your have scored {marksPercentage}%</h2>
                                        {result === 'Pass' ? <h3>Congratulations! You are PASS!</h3> : <h3>Sorry. You are unable to clear this exam. Better luck next time!</h3> }
                                        <p>Your trainer will reach out to you on the next steps. Please stay calm!</p>
                                        <div>
                                            <button onClick={this.logOut}>Exit</button>
                                        </div>
                                    </>
                                : 
                                <>
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
                                </>
                            }
                        </div>
                    }
                </div>
            </div>
        )
    }
}

export default Quiz;
