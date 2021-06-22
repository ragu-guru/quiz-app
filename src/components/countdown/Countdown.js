import React, {useState, useEffect} from 'react';
import {calculateTimeLeft} from '../../assets/js/helpers';
import './Countdown.scss';

export default function Countdown(props) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(props.endTime));

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft(props.endTime));
        }, 1000);
        // Clear timeout if the component is unmounted
        return () => clearTimeout(timer);
    }, [timeLeft, props.endTime]);

    const timerComponents = [];
    console.log(props.endTime)

    Object.keys(timeLeft).forEach((interval, index) => {
        if (!timeLeft[interval] || interval === 'totalTimeLeftInSec') {
            return;
        }

        timerComponents.push(
            <span key={index}>
            {timeLeft[interval]} {interval}{" "}
            </span>
        );
    });
    console.log(timerComponents)
    return (
        <div className="countdown">
            {props.text}  {timerComponents.length ? <span>{timerComponents}</span> : <span>Time's up!</span>}
        </div>  
    );
}
