import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select'
import dayjs from 'dayjs';
import DateTimePicker from 'react-datetime-picker';
import './Schedule.scss';

function Schedule() {
    const [allCourses, setAllCourses] = useState([]);
    const [dateTime, setDateTime] = useState();
    const [courseId, setCourseId] = useState(0);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleCourseChange = (e) => {
        let course_id = e.target.value;
        setCourseId(course_id);
        setSuccess(false);
    }

    const handleCalendar = (value) => {
        setDateTime(value);
        setError(false);
        setSuccess(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!dateTime) {
            setError('Please select valid date');
            return;
        }
        let data = {
            course_id: courseId,
            schedule: dayjs(dateTime).unix()
        };

        console.log(data);

        axios.get(process.env.REACT_APP_ADD_SCHEDULE_API, {params: data}).then(response => {
            if(response.data.message === 'Success') {
                setSuccess(true);
                setDateTime();
            }
        });
    }

    // Get course list.
    useEffect(() => {
        axios.get(process.env.REACT_APP_COURSES_API).then(response => {
            setAllCourses(response.data);
            setCourseId(response.data[0].course_id);
        });
    }, []);

    return (
        <div className="attendees">
            <h1>Schedule Class</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Select Course:
                    <select onChange={handleCourseChange}>
                        {allCourses.length && allCourses.map(course => (
                            <option key={course.course_id} value={course.course_id}>{course.course_name}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Class Date & Timing:
                    <DateTimePicker
                        onChange={handleCalendar}
                        value={dateTime}
                    />
                    <span className="error">{error}</span>
                    
                </label>
                
                <button type="submit"  className="login__button">Proceed</button>
                {success && <span className="success">Successfully Added!</span>}
            </form>
        </div>
    )
}

export default Schedule
