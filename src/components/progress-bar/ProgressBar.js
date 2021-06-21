import React from 'react';
import './ProgressBar.scss';

const ProgressBar = (props) => {
    const questionsLeft = props.questionLength - props.noOfQuestionsAnswered;
    return (
        <div className="progress">
            <p className="progress__counter">
                { questionsLeft !== 0 ? (<span>Questions Left: {props.questionLength - props.noOfQuestionsAnswered}</span>) : `100% answered`}
            </p>
            <div className="progress__bar" style={{'width': ((props.noOfQuestionsAnswered) / props.questionLength) * 100 + '%'}}></div>
        </div>
    );
}

export default ProgressBar;