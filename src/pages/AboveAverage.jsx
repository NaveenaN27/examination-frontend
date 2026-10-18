import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import API from "../services/api";

function AboveAverage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDepartment, setSelectedDepartment] =
    useState("ALL");

  const [selectedExam, setSelectedExam] =
    useState("ALL");

  const departments = [
    "CSE",
    "IT",
    "ECE",
    "EEE",
    "AML",
    "ADS",
    "MECH",
    "CYBER",
  ];

  useEffect(() => {
    loadAboveAverage();
  }, []);

  const loadAboveAverage = async () => {
    try {
      const response = await API.get(
        "/marks/above-average"
      );

      setRecords(response.data);

    } catch (error) {
      console.error(
        "Above average loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    Backend result format:

    [
      studentName,
      department,
      subjectName,
      examName,
      marksObtained
    ]
  */

  const formattedRecords = records.map(
    (record, index) => ({
      id: index + 1,
      studentName: record[0],
      department: record[1],
      subjectName: record[2],
      examName: record[3],
      marksObtained: record[4],
    })
  );

  const filteredRecords =
    formattedRecords.filter((record) => {

      const departmentMatch =
        selectedDepartment === "ALL" ||
        record.department === selectedDepartment;

      const examMatch =
        selectedExam === "ALL" ||
        record.examName === selectedExam;

      return departmentMatch && examMatch;
    });

  if (loading) {
    return (
      <div className="loading-message">
        Loading above average students...
      </div>
    );
  }

  return (
    <div className="above-average-page">

      <div className="page-heading">

        <div>
          <h2>Above Average Students</h2>

          <p>
            Students who scored above the subject
            average
          </p>
        </div>

      </div>

      <div className="info-banner">

        <TrendingUp size={24} />

        <div>
          <strong>Subquery Result</strong>

          <p>
            This page displays students whose marks
            are greater than the average mark of the
            same subject and exam.
          </p>
        </div>

      </div>

      <div className="filter-bar results-filter">

        <div className="filter-group">

          <label>Department</label>

          <select
            value={selectedDepartment}
            onChange={(event) =>
              setSelectedDepartment(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Departments
            </option>

            {departments.map((department) => (
              <option
                key={department}
                value={department}
              >
                {department}
              </option>
            ))}

          </select>

        </div>

        <div className="filter-group">

          <label>Exam</label>

          <select
            value={selectedExam}
            onChange={(event) =>
              setSelectedExam(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Exams
            </option>

            <option value="Model Exam">
              Model Exam
            </option>

            <option value="Semester Exam">
              Semester Exam
            </option>

            <option value="Semester Practical Exam">
              Semester Practical Exam
            </option>

          </select>

        </div>

      </div>

      <div className="table-card">

        <div className="table-card-header">

          <div>
            <h3>Above Average List</h3>

            <p>
              Showing {filteredRecords.length} records
            </p>
          </div>

        </div>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>S.No</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Subject</th>
                <th>Exam</th>
                <th>Marks</th>
              </tr>
            </thead>

            <tbody>

              {filteredRecords.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="empty-table"
                  >
                    No above-average records found
                  </td>
                </tr>

              ) : (

                filteredRecords.map(
                  (record, index) => (

                    <tr key={record.id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {record.studentName}
                        </strong>
                      </td>

                      <td>
                        <span className="department-badge">
                          {record.department}
                        </span>
                      </td>

                      <td>
                        {record.subjectName}
                      </td>

                      <td>
                        <span className="exam-badge">
                          {record.examName}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {record.marksObtained}
                        </strong>
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AboveAverage;