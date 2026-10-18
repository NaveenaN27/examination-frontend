import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Printer,
  LogOut,
  GraduationCap,
  Award,
  BookOpen,
  Percent,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";

import API from "../services/api";

import femaleAvatar from "../assets/female-graduate-avatar.png";
import maleAvatar from "../assets/male-graduate-avatar.png";

function StudentResult() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);

  const [previousResults, setPreviousResults] = useState([]);
  const [semesterSummaries, setSemesterSummaries] = useState([]);

  const [expandedSemester, setExpandedSemester] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");

  // =====================================================
  // CHECK LOGIN
  // =====================================================

  useEffect(() => {
    const studentLoggedIn =
      localStorage.getItem("studentLoggedIn");

    if (
      studentLoggedIn !== "true" ||
      !studentId
    ) {
      navigate("/student-login");
      return;
    }

    loadStudentData();
  }, []);

  // =====================================================
  // LOAD STUDENT DATA
  // =====================================================

  const loadStudentData = async () => {
    try {
      setLoading(true);

      const [
        studentsResponse,
        marksResponse,
        previousResponse,
      ] = await Promise.all([
        API.get("/students"),
        API.get("/marks/details"),
        API.get(
          `/previous-semesters/student/${studentId}`
        ),
      ]);

      const allStudents =
        studentsResponse.data;

      const foundStudent =
        allStudents.find(
          (item) =>
            Number(item.studentId) ===
            Number(studentId)
        );

      if (!foundStudent) {
        alert("Student not found.");
        handleLogout();
        return;
      }

      setStudent(foundStudent);

      const studentMarks =
        marksResponse.data.filter(
          (record) =>
            record[0] ===
              foundStudent.studentName &&
            record[1] ===
              foundStudent.department
        );

      setMarks(studentMarks);

      setPreviousResults(
        previousResponse.data.results || []
      );

      setSemesterSummaries(
        previousResponse.data.summaries || []
      );

    } catch (error) {
      console.error(
        "Student result loading error:",
        error
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // AVATAR
  // =====================================================

  const getAvatar = (gender) => {
    if (gender === "Female") {
      return femaleAvatar;
    }

    if (gender === "Male") {
      return maleAvatar;
    }

    return null;
  };

  // =====================================================
  // GRADE
  // =====================================================

  const getGrade = (score) => {
    if (score >= 90) return "O";
    if (score >= 80) return "A+";
    if (score >= 70) return "A";
    if (score >= 60) return "B+";
    if (score >= 50) return "B";
    if (score >= 40) return "C";

    return "F";
  };

  const getGradePoint = (score) => {
    if (score >= 90) return 10;
    if (score >= 80) return 9;
    if (score >= 70) return 8;
    if (score >= 60) return 7;
    if (score >= 50) return 6;
    if (score >= 40) return 5;

    return 0;
  };

  // =====================================================
  // SEMESTER 5 FINAL RESULT
  // MODEL 40 + SEMESTER 60
  // =====================================================

  const finalResults = useMemo(() => {
    const modelRecords =
      marks.filter(
        (record) =>
          record[3] === "Model Exam"
      );

    const semesterRecords =
      marks.filter(
        (record) =>
          record[3] === "Semester Exam"
      );

    return semesterRecords.map(
      (semesterRecord) => {

        const subjectName =
          semesterRecord[2];

        const modelRecord =
          modelRecords.find(
            (record) =>
              record[2] ===
              subjectName
          );

        const modelMark =
          modelRecord
            ? Number(modelRecord[4])
            : 0;

        const semesterMark =
          Number(
            semesterRecord[4]
          );

        const modelConverted =
          modelMark * 0.4;

        const semesterConverted =
          semesterMark * 0.6;

        const finalScore =
          modelConverted +
          semesterConverted;

        return {
          subjectName,
          modelMark,
          modelConverted,
          semesterMark,
          semesterConverted,
          finalScore,

          grade:
            getGrade(finalScore),

          gradePoint:
            getGradePoint(
              finalScore
            ),

          status:
            finalScore >= 40
              ? "PASS"
              : "FAIL",
        };
      }
    );
  }, [marks]);

  // =====================================================
  // SEMESTER 5 SUMMARY
  // =====================================================

  const total =
    finalResults.reduce(
      (sum, result) =>
        sum + result.finalScore,
      0
    );

  const maximum =
    finalResults.length * 100;

  const percentage =
    maximum > 0
      ? (total / maximum) * 100
      : 0;

  const currentGpa =
    finalResults.length > 0
      ? finalResults.reduce(
          (sum, result) =>
            sum +
            result.gradePoint,
          0
        ) /
        finalResults.length
      : 0;

  const overallGrade =
    getGrade(percentage);

  const overallPass =
    finalResults.length > 0 &&
    finalResults.every(
      (result) =>
        result.finalScore >= 40
    );

  // =====================================================
  // OVERALL CGPA
  // SEM 1 + 2 + 3 + 4 + CURRENT SEM 5
  // =====================================================

  const currentCgpa =
    useMemo(() => {

      if (
        semesterSummaries.length === 0
      ) {
        return currentGpa;
      }

      const previousTotal =
        semesterSummaries.reduce(
          (sum, summary) =>
            sum +
            Number(summary.sgpa),
          0
        );

      return (
        previousTotal +
        currentGpa
      ) /
        (
          semesterSummaries.length +
          1
        );

    }, [
      semesterSummaries,
      currentGpa,
    ]);

  // =====================================================
  // PREVIOUS SEMESTERS
  // =====================================================

  const sortedSemesterSummaries =
    [...semesterSummaries].sort(
      (a, b) =>
        Number(b.semester) -
        Number(a.semester)
    );

  const getSemesterResults = (
    semester
  ) => {

    return previousResults.filter(
      (result) =>
        Number(result.semester) ===
        Number(semester)
    );
  };

  // =====================================================
  // VIEW / HIDE
  // =====================================================

  const toggleSemester = (
    semester
  ) => {

    if (
      Number(expandedSemester) ===
      Number(semester)
    ) {
      setExpandedSemester(null);
    } else {
      setExpandedSemester(semester);
    }
  };

  // =====================================================
  // DOWNLOAD PREVIOUS SEMESTER
  // =====================================================

  const downloadSemester = (
    summary
  ) => {

    if (!student) {
      return;
    }

    const semesterResults =
      getSemesterResults(
        summary.semester
      );

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1000,height=800"
      );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to download the result."
      );
      return;
    }

    const rows =
      semesterResults
        .map(
          (result) => `

            <tr>

              <td>
                Semester-${result.semester}
              </td>

              <td>
                ${result.courseCode}
              </td>

              <td>
                ${result.courseName}
              </td>

              <td>
                ${result.credit}
              </td>

              <td>
                ${result.gradePoint}
              </td>

              <td>
                ${result.grade}
              </td>

              <td>
                ${result.resultStatus}
              </td>

            </tr>

          `
        )
        .join("");

    printWindow.document.write(`

      <!DOCTYPE html>

      <html>

      <head>

        <title>
          Semester ${summary.semester} Result
        </title>

        <style>

          body {
            font-family: Arial, sans-serif;
            padding: 35px;
            color: #172033;
          }

          .college {
            text-align: center;
            margin-bottom: 25px;
          }

          .college h1 {
            margin: 0;
            font-size: 24px;
          }

          .college h2 {
            margin: 8px 0;
            font-size: 17px;
          }

          .student-info {
            margin-bottom: 20px;
            padding: 14px;

            background: #f4f7fb;
            border: 1px solid #dde3ec;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            border: 1px solid #ccd4df;
            padding: 9px;
            font-size: 12px;
          }

          th {
            background: #e8f4fb;
          }

          .summary {
            margin-top: 20px;

            display: flex;
            justify-content: space-between;

            gap: 20px;

            font-size: 13px;
          }

        </style>

      </head>

      <body>

        <div class="college">

          <h1>
            St. Joseph's Institute of Technology
          </h1>

          <h2>
            Semester-${summary.semester}
            (${summary.examSession})
          </h2>

        </div>

        <div class="student-info">

          <strong>
            Student:
          </strong>

          ${student.studentName}

          &nbsp;&nbsp;

          <strong>
            Department:
          </strong>

          ${student.department}

          &nbsp;&nbsp;

          <strong>
            Student ID:
          </strong>

          ${student.studentId}

        </div>

        <table>

          <thead>

            <tr>

              <th>
                Semester
              </th>

              <th>
                Course Code
              </th>

              <th>
                Course Name
              </th>

              <th>
                Credit
              </th>

              <th>
                Grade Point
              </th>

              <th>
                Grade
              </th>

              <th>
                Result
              </th>

            </tr>

          </thead>

          <tbody>
            ${rows}
          </tbody>

        </table>

        <div class="summary">

          <div>

            <strong>
              Credit Registered:
            </strong>

            ${summary.creditRegistered}

          </div>

          <div>

            <strong>
              Credit Completed:
            </strong>

            ${summary.creditCompleted}

          </div>

          <div>

            <strong>
              SGPA:
            </strong>

            ${Number(
              summary.sgpa
            ).toFixed(2)}

          </div>

          <div>

            <strong>
              CGPA:
            </strong>

            ${Number(
              summary.cgpa
            ).toFixed(2)}

          </div>

        </div>

        <script>

          window.onload = function() {
            window.print();
          };

        </script>

      </body>

      </html>

    `);

    printWindow.document.close();
  };

  // =====================================================
  // PRINT ONLY CURRENT SEMESTER 5
  // =====================================================

  const handlePrint = () => {
    window.print();
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "studentLoggedIn"
    );

    localStorage.removeItem(
      "studentId"
    );

    localStorage.removeItem(
      "studentUsername"
    );

    navigate("/student-login");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="student-result-loading">

        Loading your result...

      </div>
    );
  }

  if (!student) {

    return (
      <div className="student-result-loading">

        Student not found.

      </div>
    );
  }

  const avatar =
    getAvatar(student.gender);

  return (

    <div className="student-result-page">

      {/* =====================================
          TOP BAR
      ===================================== */}

      <div className="student-result-topbar no-print">

        <div className="student-result-brand">

          <GraduationCap size={30} />

          <div>

            <strong>
              Student Result Portal
            </strong>

            <span>
              St. Joseph&apos;s Institute
              of Technology
            </span>

          </div>

        </div>

        <button
          type="button"
          className="student-result-logout"
          onClick={handleLogout}
        >

          <LogOut size={17} />

          Logout

        </button>

      </div>

      <div className="student-result-container">

        <div className="student-final-result-card">

          {/* =====================================
              COLLEGE HEADER
          ===================================== */}

          <div className="student-result-college">

            <div className="student-result-avatar">

              {avatar ? (

                <img
                  src={avatar}
                  alt={
                    student.studentName
                  }
                />

              ) : (

                <GraduationCap
                  size={45}
                />

              )}

            </div>

            <div>

              <h1>
                St. Joseph&apos;s Institute
                of Technology
              </h1>

              <h2>
                III Year Examination
                Final Result
              </h2>

              <p>
                {student.studentName}
                {" • "}
                {student.department}
                {" • "}
                III Year
              </p>

            </div>

          </div>

          {/* =====================================
              STUDENT INFORMATION
          ===================================== */}

          <div className="student-result-info-grid">

            <div className="student-result-info-card">

              <span>
                Student ID
              </span>

              <strong>
                #{student.studentId}
              </strong>

            </div>

            <div className="student-result-info-card">

              <span>
                Student Name
              </span>

              <strong>
                {student.studentName}
              </strong>

            </div>

            <div className="student-result-info-card">

              <span>
                Department
              </span>

              <strong>
                {student.department}
              </strong>

            </div>

            <div className="student-result-info-card">

              <span>
                Current Semester
              </span>

              <strong>
                Semester 5
              </strong>

            </div>

          </div>

          {/* =====================================
              SEMESTER 5 CURRENT RESULT
          ===================================== */}

          <div className="student-result-section">

            <div className="student-result-section-title">

              <BookOpen size={20} />

              <h3>
                Semester 5 - Current Result
              </h3>

            </div>

            <p className="student-result-formula">

              Model Exam 40% +
              Semester Exam 60%

            </p>

            <div className="student-result-table-wrapper">

              <table className="student-result-table">

                <thead>

                  <tr>

                    <th>S.No</th>
                    <th>Subject</th>
                    <th>Model /100</th>
                    <th>Model /40</th>
                    <th>Semester /100</th>
                    <th>Semester /60</th>
                    <th>Final /100</th>
                    <th>Grade</th>
                    <th>GP</th>
                    <th>Result</th>

                  </tr>

                </thead>

                <tbody>

                  {finalResults.map(
                    (
                      result,
                      index
                    ) => (

                      <tr
                        key={
                          result.subjectName
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>

                          <strong>
                            {
                              result.subjectName
                            }
                          </strong>

                        </td>

                        <td>
                          {result.modelMark.toFixed(
                            2
                          )}
                        </td>

                        <td>
                          {result.modelConverted.toFixed(
                            2
                          )}
                        </td>

                        <td>
                          {result.semesterMark.toFixed(
                            2
                          )}
                        </td>

                        <td>
                          {result.semesterConverted.toFixed(
                            2
                          )}
                        </td>

                        <td>

                          <strong>
                            {result.finalScore.toFixed(
                              2
                            )}
                          </strong>

                        </td>

                        <td>

                          <span className="student-grade-badge">
                            {
                              result.grade
                            }
                          </span>

                        </td>

                        <td>
                          {
                            result.gradePoint
                          }
                        </td>

                        <td>

                          <span
                            className={
                              result.status ===
                              "PASS"
                                ? "student-pass-badge"
                                : "student-fail-badge"
                            }
                          >

                            {
                              result.status
                            }

                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* =====================================
              SEMESTER 5 SUMMARY
          ===================================== */}

          <div className="student-result-summary">

            <div className="student-summary-card">

              <BookOpen size={24} />

              <span>
                Total
              </span>

              <strong>

                {total.toFixed(2)}
                {" / "}
                {maximum}

              </strong>

            </div>

            <div className="student-summary-card">

              <Percent size={24} />

              <span>
                Percentage
              </span>

              <strong>
                {percentage.toFixed(2)}%
              </strong>

            </div>

            <div className="student-summary-card">

              <GraduationCap size={24} />

              <span>
                Semester 5 GPA
              </span>

              <strong>
                {currentGpa.toFixed(2)}
              </strong>

            </div>

            <div className="student-summary-card">

              <Award size={24} />

              <span>
                Overall CGPA
              </span>

              <strong>
                {currentCgpa.toFixed(2)}
              </strong>

            </div>

            <div className="student-summary-card">

              <Award size={24} />

              <span>
                Result
              </span>

              <strong
                className={
                  overallPass
                    ? "student-summary-pass"
                    : "student-summary-fail"
                }
              >

                {overallPass
                  ? "PASS"
                  : "FAIL"}

              </strong>

              <small>
                Grade {overallGrade}
              </small>

            </div>

          </div>

          {/* =====================================
              PREVIOUS SEMESTERS

              IMPORTANT:
              no-print added here.
              So blue Print / Save PDF button
              will NOT print Sem 1-4.
          ===================================== */}

          <div className="previous-semesters-section student-previous-section no-print">

            <div className="previous-semesters-heading">

              <h3>
                Previous Semesters
              </h3>

              <p>
                View your Semester 1 to
                Semester 4 examination
                results
              </p>

            </div>

            {sortedSemesterSummaries.length ===
            0 ? (

              <div className="previous-loading">

                Previous semester results
                are not available.

              </div>

            ) : (

              sortedSemesterSummaries.map(
                (summary) => {

                  const semester =
                    Number(
                      summary.semester
                    );

                  const isOpen =
                    Number(
                      expandedSemester
                    ) === semester;

                  const semesterResults =
                    getSemesterResults(
                      semester
                    );

                  return (

                    <div
                      className="previous-semester-card"
                      key={
                        summary.summaryId
                      }
                    >

                      {/* HEADER */}

                      <div className="previous-semester-header">

                        <div>

                          <strong>

                            Semester-
                            {semester}
                            {" ("}
                            {
                              summary.examSession
                            }
                            {")"}

                          </strong>

                        </div>

                        <div className="previous-semester-actions">

                          <button
                            type="button"
                            onClick={() =>
                              toggleSemester(
                                semester
                              )
                            }
                          >

                            {isOpen ? (

                              <>
                                <EyeOff
                                  size={16}
                                />
                                Hide
                              </>

                            ) : (

                              <>
                                <Eye
                                  size={16}
                                />
                                View
                              </>

                            )}

                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              downloadSemester(
                                summary
                              )
                            }
                          >

                            <Download
                              size={16}
                            />

                            Download

                          </button>

                        </div>

                      </div>

                      {/* SEMESTER DETAILS */}

                      {isOpen && (

                        <div className="previous-semester-details">

                          <div className="table-wrapper">

                            <table className="previous-result-table">

                              <thead>

                                <tr>

                                  <th>
                                    Semester
                                  </th>

                                  <th>
                                    Course Code
                                  </th>

                                  <th>
                                    Course Name
                                  </th>

                                  <th>
                                    Credit
                                  </th>

                                  <th>
                                    Grade Point
                                  </th>

                                  <th>
                                    Grade
                                  </th>

                                  <th>
                                    Result Status
                                  </th>

                                </tr>

                              </thead>

                              <tbody>

                                {semesterResults.map(
                                  (result) => (

                                    <tr
                                      key={
                                        result.resultId
                                      }
                                    >

                                      <td>

                                        Semester-
                                        {
                                          result.semester
                                        }

                                      </td>

                                      <td>
                                        {
                                          result.courseCode
                                        }
                                      </td>

                                      <td>
                                        {
                                          result.courseName
                                        }
                                      </td>

                                      <td>
                                        {
                                          result.credit
                                        }
                                      </td>

                                      <td>
                                        {
                                          result.gradePoint
                                        }
                                      </td>

                                      <td>

                                        <strong>
                                          {
                                            result.grade
                                          }
                                        </strong>

                                      </td>

                                      <td>

                                        <span
                                          className={
                                            result.resultStatus ===
                                            "PASS"
                                              ? "previous-pass"
                                              : "previous-fail"
                                          }
                                        >

                                          {
                                            result.resultStatus
                                          }

                                        </span>

                                      </td>

                                    </tr>

                                  )
                                )}

                              </tbody>

                            </table>

                          </div>

                          {/* PREVIOUS SEM SUMMARY */}

                          <div className="previous-summary-row">

                            <div>

                              <span>
                                Credit Registered
                              </span>

                              <strong>
                                {
                                  summary.creditRegistered
                                }
                              </strong>

                            </div>

                            <div>

                              <span>
                                Credit Completed
                              </span>

                              <strong>
                                {
                                  summary.creditCompleted
                                }
                              </strong>

                            </div>

                            <div>

                              <span>
                                SGPA
                              </span>

                              <strong>
                                {Number(
                                  summary.sgpa
                                ).toFixed(
                                  2
                                )}
                              </strong>

                            </div>

                            <div>

                              <span>
                                CGPA
                              </span>

                              <strong>
                                {Number(
                                  summary.cgpa
                                ).toFixed(
                                  2
                                )}
                              </strong>

                            </div>

                          </div>

                        </div>

                      )}

                    </div>

                  );
                }
              )

            )}

          </div>

          {/* =====================================
              BLUE BUTTON
              KEEP SAME
              PRINTS CURRENT SEMESTER 5 ONLY
          ===================================== */}

          <div className="student-result-actions no-print">

            <button
              type="button"
              className="student-print-button"
              onClick={handlePrint}
            >

              <Printer size={18} />

              Print / Save PDF

            </button>

          </div>

          {/* =====================================
              FOOTER
          ===================================== */}

          <div className="student-result-footer">

            <span>
              Examination Management System
            </span>

            <span>
              St. Joseph&apos;s Institute
              of Technology
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default StudentResult;