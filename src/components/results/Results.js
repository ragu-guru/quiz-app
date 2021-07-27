import React, {useState, useEffect} from 'react';
import './Results.scss';
import logo from '../../assets/images/efg.jpeg';
import axios from 'axios';


function Results() {
    const [allCourses, setAllCourses] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [classId, setclassId] = useState(0);
    const [results, setResults] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(classId);
        axios.get(process.env.REACT_APP_RESULTS_API, { params: {classId}}).then(response => {
            setResults(response.data);
        });
    }

    const handleCourseChange = (event) => {
        let course_id = event.target.value;
        console.log(event.target);
        axios.get(process.env.REACT_APP_SCHEDULE_API, { params: {course_id}}).then(response => {
            setSchedule(response.data);
        });
    }

    const handleScheduleChange = (event) => {
        setclassId(event.target.value);
    }
    
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
            console.log(response.data[0]);
            setclassId(response.data[0].class_id);
        });
    }, [allCourses]);

    return (
        <div className="results">
            <div className="login">
                <div className="login__logo">
                    <img src={logo} alt="Efg Logo" />
                </div>
                <div className="login__form">
                    <form onSubmit={handleSubmit}>
                        <label>
                            Select your course:
                            <select onChange={handleCourseChange}>
                                {allCourses.length && allCourses.map(course => (
                                    <option key={course.course_id} value={course.course_id}>{course.course_name}</option>
                                ))}
                            </select>
                        </label>
                        { schedule.length
                            ? 
                                <label>
                                    Exam date:
                                    <select onChange={handleScheduleChange}>
                                        {schedule.map(schedule => (
                                            <option key={schedule.class_id} value={schedule.class_id}>{schedule.date}</option>
                                        ))}
                                    </select>
                                </label>
                            :
                                <p className="error">No classed found for the selected course. Please select correct course name.</p>
                        }
                        <button type="submit"  className="login__button">Proceed</button>
                    </form>
                </div>
            </div>
            {results.length > 0 &&
                <>
                    <table border="1" cellPadding="5">
                        <tbody>
                            <tr>
                                <th>
                                    Student Name
                                </th>
                                <th>
                                    NRIC
                                </th>
                                <th>
                                    Company
                                </th>
                                <th>
                                    Marks Percentage
                                </th>
                                <th>
                                    Result
                                </th>
                            </tr>
                            {results.map(student => (
                                <tr key={student.nric}>
                                    <td>{student.name}</td>
                                    <td>{student.nric}</td>
                                    <td>{student.company}</td>
                                    <td>{student.marks}</td>
                                    <td>{student.result}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            }
        </div>
    )
}

export default Results;

