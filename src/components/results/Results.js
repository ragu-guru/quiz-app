import React, {useState, useEffect} from 'react';
import { useTable, useSortBy } from 'react-table';
import dayjs from 'dayjs';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import './Results.scss';
// Importing the login css since we have a login box style for form.
import "../login/Login.scss";
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
        axios.get(process.env.REACT_APP_SCHEDULE_API, { params: {course_id, completed: 1}}).then(response => {
            setSchedule(response.data);
        });
    }

    const handleScheduleChange = (event) => {
        setclassId(event.target.value);
    }
    
    // Get course list
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
        axios.get(process.env.REACT_APP_SCHEDULE_API, { params: {course_id, completed: 1}}).then(response => {
            setSchedule(response.data);
            console.log(response.data[0]);
            setclassId(response.data[0].class_id);
        });
    }, [allCourses]);

    
    const columns = React.useMemo(
        () => [
          {
            Header: 'Student Name',
            accessor: 'name', // accessor is the "key" in the data
          },
          {
            Header: 'NRIC',
            accessor: 'nric',
          },
          {
            Header: 'Company',
            accessor: 'company',
          },
          {
            Header: 'Question Set',
            accessor: (originalRow, rowIndex) => rowIndex + 1,
          },
          {
            Header: 'Marks Percentage',
            accessor: 'marks',
          },
          {
            Header: 'Result',
            accessor: 'result',
          },
        ],
        []
    );
    
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data: results }, useSortBy);


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
                                            <option key={schedule.class_id} value={schedule.class_id}>{dayjs.unix(schedule.date).format('DD/MM/YYYY HH:mm:ss')}</option>
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
                    <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button"
                    table="table-to-xls"
                    filename="tablexls"
                    sheet="tablexls"
                    buttonText="Download as XLS"/>
                    <table {...getTableProps()} id="table-to-xls" style={{ border: 'solid 1px blue' }}>
                    <thead>
                        {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                            <th
                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                style={{
                                background: 'aliceblue',
                                color: 'black',
                                fontWeight: 'bold',
                                }}
                            >
                                {column.render('Header')}
                                <span>
                                    {column.isSorted
                                    ? column.isSortedDesc
                                        ? ' 🔽'
                                        : ' 🔼'
                                    : ''}
                                </span>
                            </th>
                            ))}
                        </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map(row => {
                        prepareRow(row)
                        console.log(row)
                        return (
                            <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return (
                                <td
                                    {...cell.getCellProps()}
                                    style={{
                                    padding: '10px',
                                    border: 'solid 1px gray',
                                    }}
                                >
                                    {cell.render('Cell')}
                                </td>
                                )
                            })}
                            </tr>
                        )
                        })}
                    </tbody>
                    </table>
                </>
            }
        </div>
    )
}

export default Results;

