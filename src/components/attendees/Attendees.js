import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select'
import dayjs from 'dayjs';
import { validateNRIC } from '../../assets/js/helpers';
import './Attendees.scss';

function Attendees() {
    const [allCourses, setAllCourses] = useState([]);
    const [courseId, setCourseId] = useState(0);
    const [schedule, setSchedule] = useState([]);
    const [classId, setClassId] = useState(0);
    const [students, setStudents] = useState([]);
    const [nric, setNric] = useState('');
    const [studentId, setstudentId] = useState('');
    const [studentName, setStudentName] = useState('');
    const [company, setCompany] = useState('');
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const nricInputRef = useRef();

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

    const handleNricChange = (selectedOption) => {
        if (!selectedOption) {
            return;
        }
        let value = selectedOption.user_id;
        setstudentId(value);
        // setNric(value);
        setSuccess(false);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        nricInputRef.current.select.clearValue();

        let data = {
            studentId,
            classId
        };

        axios.get(process.env.REACT_APP_ADD_ATTENDEE_API, {params: data}).then(response => {
            if(response.data.message === 'Success') {
                setSuccess(true);
                nricInputRef.current.select.clearValue();
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
        axios.get(process.env.REACT_APP_STUDENTS_API, {params: {nric: 'G5439445X'}}).then(response => {
            setStudents(response.data);
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
        <div className="attendees">
            <h1>Add Attendees</h1>
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
                    <Select
                        className="attendees__select"
                        ref={nricInputRef}
                        onChange={handleNricChange}
                        getOptionLabel={option => `${option.nric} - ${option.name}`}
                        getOptionValue={option => option.user_id}
                        options={students}
                    />
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
        </div>
    )
}

export default Attendees;
