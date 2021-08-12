import React, { useState, useRef, useEffect } from 'react';
import { useTable, useSortBy } from 'react-table';
import axios from 'axios';
import { validateNRIC } from '../../assets/js/helpers';

function Users() {
    const [nric, setNric] = useState('');
    const [studentName, setStudentName] = useState('');
    const [company, setCompany] = useState('');
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [students, setStudents] = useState([]);

    const inputRef = useRef();

    const handleNricChange = (e) => {
        let value = e.target.value;
        setNric(value);
        setError(false);
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
            company
        };

        axios.get(process.env.REACT_APP_ADD_STUDENT_API, {params: data}).then(response => {
            if(response.data.message === 'Success') {
                setSuccess(true);
                setNric('');
                setStudentName('');
                setCompany('');
            } else {
                console.log(response);
            }
        }).catch(function (error) {
            // handle error
            console.log(error);
        });
    }

    // Get Users list
    useEffect(() => {
        axios.get(process.env.REACT_APP_STUDENTS_API, {params: {nric: 'G5439445X'}}).then(response => {
            setStudents(response.data);
        });
    }, []);

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
          }
        ],
        []
    );
    
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data: students }, useSortBy);

    return (
        <div>
            <h1>Add new Student</h1>
            <form onSubmit={handleSubmit}>
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
                <button type="submit"  className="login__button">Proceed</button>
                {success && <span className="success">Successfully Added!</span>}
            </form>

            <h2>Recently Added Students:</h2>
            {students.length > 0 &&
                <>
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

export default Users;
