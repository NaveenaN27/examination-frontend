import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Trophy,
  TrendingUp,
  CircleCheck,
  CircleX,
} from "lucide-react";
import API from "../services/api";

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [markDetails, setMarkDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [
        studentResponse,
        subjectResponse,
        examResponse,
        markResponse,
      ] = await Promise.all([
        API.get("/students"),
        API.get("/subjects"),
        API.get("/exams"),
        API.get("/marks/details"),
      ]);

      setStudents(studentResponse.data);
      setSubjects(subjectResponse.data);
      setExams(examResponse.data);
      setMarkDetails(markResponse.data);
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // =====================================
  // DEPARTMENT STUDENT COUNT
  // =====================================

  const departmentData = departments.map((department) => ({
    department,
    count: students.filter(
      (student) => student.department === department
    ).length,
  }));

  // =====================================
  // FINAL RESULT CALCULATION
  // MODEL 40 + SEMESTER 60
  // =====================================

  const studentResults = students.map((student) => {
    const records = markDetails.filter(
      (record) =>
        record[0] === student.studentName &&
        record[1] === student.department
    );

    const semesterRecords = records.filter(
      (record) => record[3] === "Semester Exam"
    );

    const finalSubjects = semesterRecords.map(
      (semesterRecord) => {
        const subjectName = semesterRecord[2];

        const modelRecord = records.find(
          (record) =>
            record[2] === subjectName &&
            record[3] === "Model Exam"
        );

        const modelMark = modelRecord
          ? Number(modelRecord[4])
          : 0;

        const semesterMark = Number(semesterRecord[4]);

        const modelConverted =
          (modelMark * 40) / 100;

        const semesterConverted =
          (semesterMark * 60) / 100;

        const finalScore =
          modelConverted + semesterConverted;

        return {
          subjectName,
          finalScore,
        };
      }
    );

    const total = finalSubjects.reduce(
      (sum, subject) => sum + subject.finalScore,
      0
    );

    const percentage =
      finalSubjects.length > 0
        ? total / finalSubjects.length
        : 0;

    const pass =
      finalSubjects.length > 0 &&
      finalSubjects.every(
        (subject) => subject.finalScore >= 40
      );

    return {
      studentId: student.studentId,
      studentName: student.studentName,
      department: student.department,
      percentage,
      pass,
    };
  });

  // =====================================
  // PASS / FAIL ANALYTICS
  // =====================================

  const studentsWithResults = studentResults.filter(
    (student) => student.percentage > 0
  );

  const passedStudents = studentsWithResults.filter(
    (student) => student.pass
  ).length;

  const failedStudents = studentsWithResults.filter(
    (student) => !student.pass
  ).length;

  const passPercentage =
    studentsWithResults.length > 0
      ? (passedStudents / studentsWithResults.length) * 100
      : 0;

  const failPercentage =
    studentsWithResults.length > 0
      ? (failedStudents / studentsWithResults.length) * 100
      : 0;

  // =====================================
  // HIGHEST SCORER
  // =====================================

  const sortedStudents = [...studentsWithResults].sort(
    (a, b) => b.percentage - a.percentage
  );

  const topper =
    sortedStudents.length > 0 ? sortedStudents[0] : null;

  // =====================================
  // SUBJECT WISE FINAL AVERAGE
  // =====================================

  const subjectScoreMap = {};

  students.forEach((student) => {
    const records = markDetails.filter(
      (record) =>
        record[0] === student.studentName &&
        record[1] === student.department
    );

    const semesterRecords = records.filter(
      (record) => record[3] === "Semester Exam"
    );

    semesterRecords.forEach((semesterRecord) => {
      const subjectName = semesterRecord[2];

      const modelRecord = records.find(
        (record) =>
          record[2] === subjectName &&
          record[3] === "Model Exam"
      );

      if (!modelRecord) return;

      const modelMark = Number(modelRecord[4]);
      const semesterMark = Number(semesterRecord[4]);

      const finalScore =
        modelMark * 0.4 + semesterMark * 0.6;

      if (!subjectScoreMap[subjectName]) {
        subjectScoreMap[subjectName] = [];
      }

      subjectScoreMap[subjectName].push(finalScore);
    });
  });

  const subjectAverages = Object.entries(subjectScoreMap)
    .map(([subjectName, marks]) => ({
      subjectName,
      average:
        marks.reduce((sum, mark) => sum + mark, 0) /
        marks.length,
    }))
    .sort((a, b) => b.average - a.average);

  if (loading) {
    return (
      <div className="loading-message">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>
            III Year Examination Management Overview
          </p>
        </div>
      </div>

      {/* MAIN CARDS */}

      <div className="dashboard-cards">

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <Users size={25} />
          </div>

          <div>
            <p>III Year Students</p>
            <h3>{students.length}</h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <BookOpen size={25} />
          </div>

          <div>
            <p>Total Subjects</p>
            <h3>{subjects.length}</h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <CalendarDays size={25} />
          </div>

          <div>
            <p>Total Exams</p>
            <h3>{exams.length}</h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <ClipboardCheck size={25} />
          </div>

          <div>
            <p>Result Records</p>
            <h3>{markDetails.length}</h3>
          </div>
        </div>

      </div>

      {/* PASS / FAIL / TOPPER */}

      <div className="dashboard-cards">

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <CircleCheck size={25} />
          </div>

          <div>
            <p>Overall Pass</p>
            <h3>{passPercentage.toFixed(1)}%</h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <CircleX size={25} />
          </div>

          <div>
            <p>Overall Fail</p>
            <h3>{failPercentage.toFixed(1)}%</h3>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <Trophy size={25} />
          </div>

          <div>
            <p>Highest Scorer</p>

            <h3 style={{ fontSize: "18px" }}>
              {topper ? topper.studentName : "-"}
            </h3>

            {topper && (
              <small>
                {topper.department} •{" "}
                {topper.percentage.toFixed(2)}%
              </small>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <TrendingUp size={25} />
          </div>

          <div>
            <p>Students Passed</p>
            <h3>
              {passedStudents} / {studentsWithResults.length}
            </h3>
          </div>
        </div>

      </div>

      {/* LOWER SECTION */}

      <div className="dashboard-section">

        {/* DEPARTMENT */}

        <div className="section-card">
          <h3>Department-wise Students</h3>

          <div className="department-list">

            {departmentData.map((item) => (
              <div
                className="department-item"
                key={item.department}
              >
                <span>{item.department}</span>
                <strong>{item.count}</strong>
              </div>
            ))}

          </div>
        </div>

        {/* TOP 3 */}

        <div className="section-card">
          <h3>Top 3 Students</h3>

          {sortedStudents.slice(0, 3).map(
            (student, index) => (
              <div
                className="department-item"
                key={student.studentId}
                style={{ marginBottom: "10px" }}
              >
                <div>
                  <strong>
                    #{index + 1} {student.studentName}
                  </strong>

                  <div
                    style={{
                      fontSize: "11px",
                      marginTop: "4px",
                      color: "#7c8496",
                    }}
                  >
                    {student.department}
                  </div>
                </div>

                <strong>
                  {student.percentage.toFixed(2)}%
                </strong>
              </div>
            )
          )}

        </div>

      </div>

      {/* SUBJECT AVERAGE */}

      <div
        className="table-card"
        style={{ marginTop: "20px" }}
      >

        <div className="table-card-header">
          <h3>Subject-wise Final Average</h3>

          <p>
            Based on Model 40% + Semester 60%
          </p>
        </div>

        <div className="table-wrapper">

          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Subject</th>
                <th>Average Final Score</th>
              </tr>
            </thead>

            <tbody>

              {subjectAverages.map((subject, index) => (
                <tr key={subject.subjectName}>
                  <td>{index + 1}</td>

                  <td>
                    <strong>
                      {subject.subjectName}
                    </strong>
                  </td>

                  <td>
                    {subject.average.toFixed(2)} / 100
                  </td>
                </tr>
              ))}

            </tbody>
          </table>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;