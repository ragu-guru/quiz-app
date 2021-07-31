import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { validateNRIC } from '../../assets/js/helpers'

function Dashboard() {
    const [allCourses, setAllCourses] = useState([]);
    const [courseId, setCourseId] = useState(0);
    const [schedule, setSchedule] = useState([]);
    const [classId, setClassId] = useState(0);
    const [nric, setNric] = useState('');
    const [studentName, setStudentName] = useState('');
    const [company, setCompany] = useState('');
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const inputRef = useRef();

    const handleCourseChange = (e) => {
        let course_id = e.target.value;
        setCourseId(course_id);
        console.log(e.target.value);
        axios.get(process.env.REACT_APP_SCHEDULE_API, { params: {course_id}}).then(response => {
            setSchedule(response.data);
            if( Array.isArray(response.data) && response.data[0].hasOwnProperty('class_id')) {
                setClassId(response.data[0].class_id);
            }
        });
    }

    const handleNricChange = (e) => {
        let value = e.target.value;
        setNric(value);
        setSuccess(false);
    }

    const handleStudentNameChange = (e) => {
        let value = e.target.value;
        setStudentName(value);
    }

    const handleCompanyChange = (e) => {
        let value = e.target.value;
        setCompany(value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!validateNRIC(nric)) {
            setError(`Please enter a valid IC number`);
            inputRef.current.focus();
            return;
        }

        let data = {
            nric,
            studentName,
            company,
            classId
        };

        axios.get(process.env.REACT_APP_STUDENT_API, {params: data}).then(response => {
            if(response.data.message === 'Success') {
                setSuccess(true);
                setNric('');
                setStudentName('');
                setCompany('');
            }
        });
    }

    const handleScheduleChange = (event) => {
        setClassId(event.target.value);
    }

    // Get course list.
    useEffect(() => {
        axios.get(process.env.REACT_APP_COURSES_API).then(response => {
            setAllCourses(response.data);
        });
    }, []);

    useEffect(() => {
        if(!allCourses.length) {
            return;
        }
        const { course_id } = allCourses[0];
        axios.get(process.env.REACT_APP_SCHEDULE_API, { params: {course_id}}).then(response => {
            setSchedule(response.data);
            console.log(response.data);
            if( Array.isArray(response.data) && response.data[0].hasOwnProperty('class_id')) {
                setClassId(response.data[0].class_id);
            }
        });
    }, [allCourses]);

    return (
        <>
            <h1>Add student data</h1>
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
                    Student NRIC/FIN/WP:
                    <input type="text" ref={inputRef} value={nric} onChange={handleNricChange} placeholder="GXXXXXXXX" />
                    <span className="error">{error}</span>
                </label>
                <label>
                    Student Name:
                    <input type="text" value={studentName} onChange={handleStudentNameChange} placeholder="Enter Student name" />
                </label>
                <label>
                    Student Company:
                    <input type="text" value={company} onChange={handleCompanyChange} placeholder="Enter Company name" />
                </label>
                { schedule.length
                    ? 
                        <label>
                            Available Classes:
                            <select onChange={handleScheduleChange}>
                                {schedule.map(schedule => (
                                    <option key={schedule.class_id} value={schedule.class_id}>{dayjs.unix(schedule.date).format('DD/MM/YYYY HH:mm:ss')}</option>
                                ))}
                            </select>
                        </label>
                    :
                        <p className="error">No classed found for the selected course. Please select correct course name.</p>
                }
                
                <button type="submit"  className="login__button">Proceed</button>
                {success && <span className="success">Successfully Added!</span>}
            </form>
        </>
    )
}

export default Dashboard;