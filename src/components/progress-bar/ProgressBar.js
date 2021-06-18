import React from 'react';
import './ProgressBar.scss';

const ProgressBar = (props) => {
    return (
        <div className="progress">
            <p className="progress__counter">
                <span>Questions {props.currentQuestion+1} of {props.questionLength}</span>
            </p>
            <div className="progress__bar" style={{'width': ((props.currentQuestion) / props.questionLength) * 100 + '%'}}></div>
        </div>
    );
}

export default ProgressBar;