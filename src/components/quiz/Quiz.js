import React from 'react';
import axios from 'axios';
import './Quiz.scss';
import ProgressBar from '../progress-bar/ProgressBar';
import {UserContext} from '../../App';
import QuizInstructions from '../quiz-instructions/QuizInstructions';



class Quiz extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showInstruction: true, // This is to show instruction page before quiz.
            questionIndex: 0, // The component will load the question based on this value. Initial value is set to 0 to match the array index.
            isLoading: true, // This is to findout whether the data fetching is still on progress. Based on this value, we will show loading gif or message.
            validationFailed: false, // Intially this will be set to false. Upon clicking event handler, we will update this value. Based on this value, the error message will be shown.
            questions: [] // Container array where the questions data from api call will be stored.
        };
    }

    // Proceed handler.
    handleProceed = () => {
        this.setState({
            showInstruction: false
        });
    }

    // onChange handler for radio buttons. Basically used to remove the validation error message.
    handleChange = (event) => {
        this.setState({
            validationFailed: false
        });
    }

    // onClick handler for quiz buttons. Basically to show next/prev questions.
    handleQuestion = (event, direction = 'next') => {
        event.preventDefault();

        // Fallback to original state to hide the validation error message.
        this.setState({
            validationFailed: false
        });

        // Validate the radio buttons and update the state to show error message.
        let selectedOption = document.querySelector('form input[type="radio"]:checked');
        if (!selectedOption && direction === 'next') {
            this.setState({
                validationFailed: true
            })
            return;
        }

        // Destructure the state.
        const {questions, questionIndex} = this.state;

        // Update the state with the selected answer.
        if (direction === 'next') {
            questions[questionIndex].answer = selectedOption.value;
            this.setState({questions: questions});

            // Tasks to do when all the questions are answered.
            if (this.state.questionIndex === questions.length - 1) {
                console.log(questions);
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

    // Fetch api data. We are using axios to get the data.
    componentDidMount() {
        axios.get("/apis/questions").then(response => {
            this.setState({ questions: response.data }); // Update the questions property in the state object.
            this.setState({ isLoading: false }); // Update isLoading property in state  object.
        });

        // Since we're re-using the same form across questions,
        // create a ref to it so we can clear its state after a question is answered.
        this.radioRef = React.createRef();
    }

    render() {
        // Show instruction based on the state value.
        if (this.state.showInstruction) {
            return (
                <div>
                    <h1>Welcome to Quiz</h1>
                    <p>Quiz instructions goes here</p>
                    <button type="button" onClick={this.handleProceed}>Proceed</button>
                </div>
            )
        }

        // Show quiz.
        const { isLoading, questionIndex, questions, validationFailed } = this.state;

        if (isLoading) {
            return <div className="App">Loading...</div>;
        }

        let { id, question, options } = questions[questionIndex];

        return (
            <div className="quiz">
                {/* // Show progress bar */}
                <ProgressBar currentQuestion={questionIndex} questionLength={questions.length} />

                {/* // Show Questions */}
                <form onSubmit={this.handleSubmit} ref={this.radioRef}>
                    <h2>
                        {question}
                    </h2>
                    {Object.keys(options).map((key) => (
                        <div key={key}>
                            <input type="radio" name={id} value={key} onChange={this.handleChange} />
                            <span>{options[key]}</span>
                        </div>
                    ))}

                    {/* // Error message. */}
                    {validationFailed && (
                        <span className="error">Please select one option</span>
                    )}

                    {/* // Prev button */}
                    {questionIndex !== 0 && (<button onClick={(e) => this.handleQuestion(e, 'prev')}>Prev</button>)}
                    
                    {/* // Next button */}
                    <button onClick={(e) => this.handleQuestion(e, 'next')}>Next</button>
                </form>
            </div>
        )
    }
}

export default Quiz;
