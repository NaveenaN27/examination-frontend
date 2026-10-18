import { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
} from "lucide-react";
import API from "../services/api";

function Rankings() {
  const [students, setStudents] = useState([]);
  const [markDetails, setMarkDetails] = useState([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState("ALL");
  const [loading, setLoading] = useState(true);

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
    loadData();
  }, []);

  // =========================================
  // LOAD DATA
  // =========================================

  const loadData = async () => {
    try {
      const [studentsResponse, marksResponse] =
        await Promise.all([
          API.get("/students"),
          API.get("/marks/details"),
        ]);

      setStudents(studentsResponse.data);
      setMarkDetails(marksResponse.data);
    } catch (error) {
      console.error("Rankings loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // GRADE
  // =========================================

  const calculateGrade = (mark) => {
    if (mark >= 90) return "O";
    if (mark >= 80) return "A+";
    if (mark >= 70) return "A";
    if (mark >= 60) return "B+";
    if (mark >= 50) return "B";
    if (mark >= 40) return "C";

    return "F";
  };

  // =========================================
  // GRADE POINT
  // =========================================

  const calculateGradePoint = (mark) => {
    if (mark >= 90) return 10;
    if (mark >= 80) return 9;
    if (mark >= 70) return 8;
    if (mark >= 60) return 7;
    if (mark >= 50) return 6;
    if (mark >= 40) return 5;

    return 0;
  };

  // =========================================
  // CALCULATE EACH STUDENT RESULT
  // =========================================

  const studentResults = students
    .map((student) => {
      const studentRecords = markDetails.filter(
        (record) =>
          record[0] === student.studentName &&
          record[1] === student.department
      );

      const semesterRecords = studentRecords.filter(
        (record) => record[3] === "Semester Exam"
      );

      const subjectResults = semesterRecords.map(
        (semesterRecord) => {
          const subjectName = semesterRecord[2];

          const modelRecord = studentRecords.find(
            (record) =>
              record[2] === subjectName &&
              record[3] === "Model Exam"
          );

          const modelMark = modelRecord
            ? Number(modelRecord[4])
            : 0;

          const semesterMark = Number(
            semesterRecord[4]
          );

          // Model /100 -> /40
          const modelConverted =
            (modelMark * 40) / 100;

          // Semester /100 -> /60
          const semesterConverted =
            (semesterMark * 60) / 100;

          // Final subject mark /100
          const finalScore =
            modelConverted + semesterConverted;

          const gradePoint =
            calculateGradePoint(finalScore);

          return {
            subjectName,
            finalScore,
            gradePoint,
          };
        }
      );

      // No semester result
      if (subjectResults.length === 0) {
        return null;
      }

      // TOTAL
      const total = subjectResults.reduce(
        (sum, subject) =>
          sum + subject.finalScore,
        0
      );

      const maximumTotal =
        subjectResults.length * 100;

      // PERCENTAGE
      const percentage =
        maximumTotal > 0
          ? (total / maximumTotal) * 100
          : 0;

      // GPA
      const totalGradePoints =
        subjectResults.reduce(
          (sum, subject) =>
            sum + subject.gradePoint,
          0
        );

      const gpa =
        subjectResults.length > 0
          ? totalGradePoints /
            subjectResults.length
          : 0;

      // PASS / FAIL
      const pass = subjectResults.every(
        (subject) => subject.finalScore >= 40
      );

      // GRADE
      const grade = pass
        ? calculateGrade(percentage)
        : "F";

      return {
        studentId: student.studentId,
        studentName: student.studentName,
        department: student.department,
        total,
        maximumTotal,
        percentage,
        gpa,
        pass,
        grade,
      };
    })
    .filter((student) => student !== null);

  // =========================================
  // DEPARTMENT FILTER
  // =========================================

  const filteredStudents =
    selectedDepartment === "ALL"
      ? studentResults
      : studentResults.filter(
          (student) =>
            student.department === selectedDepartment
        );

  // =========================================
  // SORT BY PERCENTAGE
  // =========================================

  const rankedStudents = [
    ...filteredStudents,
  ].sort((a, b) => b.percentage - a.percentage);

  // Add rank
  const rankings = rankedStudents.map(
    (student, index) => ({
      ...student,
      rank: index + 1,
    })
  );

  const topper =
    rankings.length > 0 ? rankings[0] : null;

  // =========================================
  // RANK ICON
  // =========================================

  const getRankIcon = (rank) => {
    if (rank === 1) {
      return <Trophy size={20} />;
    }

    if (rank === 2) {
      return <Medal size={20} />;
    }

    if (rank === 3) {
      return <Award size={20} />;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="loading-message">
        Loading rankings...
      </div>
    );
  }

  return (
    <div className="rankings-page">

      {/* PAGE HEADING */}

      <div className="page-heading">
        <div>
          <h2>Student Rankings</h2>

          <p>
            Rankings based on Model 40% +
            Semester 60%
          </p>
        </div>
      </div>

      {/* FILTER */}

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

      </div>

      {/* ======================================
          TOPPER CARD
      ====================================== */}

      {topper && (
        <div
          className="section-card"
          style={{
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div className="dashboard-card-icon">
              <Trophy size={30} />
            </div>

            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#7c8496",
                  marginBottom: "5px",
                }}
              >
                {selectedDepartment === "ALL"
                  ? "Overall Topper"
                  : `${selectedDepartment} Department Topper`}
              </p>

              <h2>
                {topper.studentName}
              </h2>

              <p
                style={{
                  marginTop: "6px",
                  color: "#697386",
                  fontSize: "13px",
                }}
              >
                {topper.department} •{" "}
                {topper.percentage.toFixed(2)}% •
                GPA {topper.gpa.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================
          TOP 3 CARDS
      ====================================== */}

      <div
        className="dashboard-cards"
        style={{
          gridTemplateColumns:
            "repeat(3, 1fr)",
        }}
      >

        {rankings.slice(0, 3).map((student) => (

          <div
            className="dashboard-card"
            key={student.studentId}
          >

            <div className="dashboard-card-icon">
              {getRankIcon(student.rank)}
            </div>

            <div>
              <p>
                Rank #{student.rank}
              </p>

              <h3
                style={{
                  fontSize: "17px",
                }}
              >
                {student.studentName}
              </h3>

              <small>
                {student.department}
                {" • "}
                {student.percentage.toFixed(2)}%
              </small>
            </div>

          </div>

        ))}

      </div>

      {/* ======================================
          FULL RANK LIST
      ====================================== */}

      <div className="table-card">

        <div className="table-card-header">
          <h3>Rank List</h3>

          <p>
            {selectedDepartment === "ALL"
              ? "Overall III Year ranking"
              : `${selectedDepartment} department ranking`}
          </p>
        </div>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Department</th>
                <th>Total</th>
                <th>Percentage</th>
                <th>GPA</th>
                <th>Grade</th>
                <th>Result</th>
              </tr>
            </thead>

            <tbody>

              {rankings.length === 0 ? (

                <tr>
                  <td
                    colSpan="8"
                    className="empty-table"
                  >
                    No ranking data found
                  </td>
                </tr>

              ) : (

                rankings.map((student) => (

                  <tr key={student.studentId}>

                    {/* RANK */}

                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        {getRankIcon(student.rank)}

                        <strong>
                          #{student.rank}
                        </strong>
                      </div>
                    </td>

                    {/* STUDENT */}

                    <td>
                      <strong>
                        {student.studentName}
                      </strong>
                    </td>

                    {/* DEPARTMENT */}

                    <td>
                      <span className="department-badge">
                        {student.department}
                      </span>
                    </td>

                    {/* TOTAL */}

                    <td>
                      {student.total.toFixed(2)}
                      {" / "}
                      {student.maximumTotal}
                    </td>

                    {/* PERCENTAGE */}

                    <td>
                      <strong>
                        {student.percentage.toFixed(
                          2
                        )}
                        %
                      </strong>
                    </td>

                    {/* GPA */}

                    <td>
                      {student.gpa.toFixed(2)}
                      {" / 10"}
                    </td>

                    {/* GRADE */}

                    <td>
                      <strong>
                        {student.grade}
                      </strong>
                    </td>

                    {/* RESULT */}

                    <td>
                      <span
                        className={`result-badge ${
                          student.pass
                            ? "pass"
                            : "fail"
                        }`}
                      >
                        {student.pass
                          ? "PASS"
                          : "FAIL"}
                      </span>
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* INFORMATION */}

      <div
        className="info-banner"
        style={{ marginTop: "20px" }}
      >
        <TrendingUp size={23} />

        <div>
          <strong>
            Ranking Calculation
          </strong>

          <p>
            Final ranking is calculated using
            Model Exam 40% + Semester Exam 60%.
          </p>
        </div>
      </div>

    </div>
  );
}

export default Rankings;