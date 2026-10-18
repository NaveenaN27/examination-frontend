import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  Download,
  Eye,
  EyeOff,
  GraduationCap,
  Percent,
} from "lucide-react";

import API from "../services/api";

import femaleAvatar from "../assets/female-graduate-avatar.png";
import maleAvatar from "../assets/male-graduate-avatar.png";

function Results() {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [previousResults, setPreviousResults] = useState([]);
  const [semesterSummaries, setSemesterSummaries] = useState([]);

  const [expandedSemester, setExpandedSemester] = useState(null);

  const [loadingPrevious, setLoadingPrevious] = useState(false);

  // =====================================================
  // LOAD STUDENTS + CURRENT SEMESTER MARKS
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentResponse, marksResponse] =
        await Promise.all([
          API.get("/students"),
          API.get("/marks/details"),
        ]);

      setStudents(studentResponse.data);
      setMarks(marksResponse.data);
    } catch (error) {
      console.error("Result loading error:", error);
    }
  };

  // =====================================================
  // SELECTED STUDENT
  // =====================================================

  const selectedStudent = students.find(
    (student) =>
      Number(student.studentId) === Number(selectedStudentId)
  );

  // =====================================================
  // LOAD PREVIOUS SEMESTERS
  // =====================================================

  useEffect(() => {
    if (!selectedStudentId) {
      setPreviousResults([]);
      setSemesterSummaries([]);
      setExpandedSemester(null);
      return;
    }

    loadPreviousSemesters();
  }, [selectedStudentId]);

  const loadPreviousSemesters = async () => {
    try {
      setLoadingPrevious(true);

      const response = await API.get(
        `/previous-semesters/student/${selectedStudentId}`
      );

      setPreviousResults(response.data.results || []);
      setSemesterSummaries(response.data.summaries || []);

      setExpandedSemester(null);
    } catch (error) {
      console.error(
        "Previous semester loading error:",
        error
      );

      setPreviousResults([]);
      setSemesterSummaries([]);
    } finally {
      setLoadingPrevious(false);
    }
  };

  // =====================================================
  // CURRENT STUDENT MARKS
  // =====================================================

  const studentRecords = useMemo(() => {
    if (!selectedStudent) {
      return [];
    }

    return marks.filter(
      (record) =>
        record[0] === selectedStudent.studentName &&
        record[1] === selectedStudent.department
    );
  }, [marks, selectedStudent]);

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
  // MODEL EXAM
  // =====================================================

  const modelResults = useMemo(() => {
    return studentRecords
      .filter(
        (record) =>
          record[3] === "Model Exam"
      )
      .map((record) => {
        const mark = Number(record[4]);

        return {
          subjectName: record[2],
          mark,
          status: record[5],
          grade: getGrade(mark),
        };
      });
  }, [studentRecords]);

  // =====================================================
  // SEMESTER 5 FINAL RESULT
  // Model 40 + Semester 60
  // =====================================================

  const finalResults = useMemo(() => {
    const modelRecords = studentRecords.filter(
      (record) => record[3] === "Model Exam"
    );

    const semesterRecords = studentRecords.filter(
      (record) => record[3] === "Semester Exam"
    );

    return semesterRecords.map((semesterRecord) => {
      const subjectName = semesterRecord[2];

      const modelRecord = modelRecords.find(
        (record) =>
          record[2] === subjectName
      );

      const modelMark = modelRecord
        ? Number(modelRecord[4])
        : 0;

      const semesterMark =
        Number(semesterRecord[4]);

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
        grade: getGrade(finalScore),
        gradePoint: getGradePoint(finalScore),
        status:
          finalScore >= 40
            ? "PASS"
            : "FAIL",
      };
    });
  }, [studentRecords]);

  // =====================================================
  // SEMESTER 5 SUMMARY
  // =====================================================

  const total = finalResults.reduce(
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
            sum + result.gradePoint,
          0
        ) / finalResults.length
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
  // CURRENT CGPA
  // Sem 1 + 2 + 3 + 4 + current Sem 5
  // =====================================================

  const currentCgpa = useMemo(() => {
    if (semesterSummaries.length === 0) {
      return currentGpa;
    }

    const previousSgpaTotal =
      semesterSummaries.reduce(
        (sum, summary) =>
          sum + Number(summary.sgpa),
        0
      );

    return (
      (previousSgpaTotal + currentGpa) /
      (semesterSummaries.length + 1)
    );
  }, [
    semesterSummaries,
    currentGpa,
  ]);

  // =====================================================
  // PREVIOUS SEMESTER SORT
  // 4, 3, 2, 1
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
  // DOWNLOAD / PRINT PREVIOUS SEMESTER
  // =====================================================

  const downloadSemester = (
    summary
  ) => {
    if (!selectedStudent) {
      return;
    }

    const results =
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
        "Please allow pop-ups to download the semester result."
      );
      return;
    }

    const rows = results
      .map(
        (result) => `
          <tr>
            <td>Semester-${result.semester}</td>
            <td>${result.courseCode}</td>
            <td>${result.courseName}</td>
            <td>${result.credit}</td>
            <td>${result.gradePoint}</td>
            <td>${result.grade}</td>
            <td>${result.resultStatus}</td>
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
              margin-top: 15px;
            }

            th,
            td {
              border: 1px solid #cfd6e1;
              padding: 9px;
              font-size: 12px;
            }

            th {
              background: #e8f4fb;
              text-align: left;
            }

            .summary {
              margin-top: 20px;
              display: flex;
              gap: 30px;
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
            ${selectedStudent.studentName}

            &nbsp;&nbsp;&nbsp;

            <strong>
              Department:
            </strong>
            ${selectedStudent.department}

            &nbsp;&nbsp;&nbsp;

            <strong>
              Student ID:
            </strong>
            ${selectedStudent.studentId}

          </div>

          <table>

            <thead>

              <tr>
                <th>Semester</th>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credit</th>
                <th>Grade Point</th>
                <th>Grade</th>
                <th>Result</th>
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
              ${Number(summary.sgpa).toFixed(2)}
            </div>

            <div>
              <strong>
                CGPA:
              </strong>
              ${Number(summary.cgpa).toFixed(2)}
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

  return (
    <div className="results-page">

      {/* =========================================
          PAGE HEADING
      ========================================= */}

      <div className="page-heading">

        <div>
          <h2>
            Final Results
          </h2>

          <p>
            View current and previous
            semester examination results
          </p>
        </div>

      </div>

      {/* =========================================
          STUDENT SELECT
      ========================================= */}

      <div className="form-card">

        <div className="form-group">

          <label>
            Select Student
          </label>

          <select
            value={
              selectedStudentId
            }
            onChange={(event) =>
              setSelectedStudentId(
                event.target.value
              )
            }
          >

            <option value="">
              Select Student
            </option>

            {students.map(
              (student) => (

                <option
                  key={
                    student.studentId
                  }
                  value={
                    student.studentId
                  }
                >
                  {student.studentName}
                  {" - "}
                  {student.department}
                </option>

              )
            )}

          </select>

        </div>

      </div>

      {/* =========================================
          RESULT
      ========================================= */}

      {selectedStudent && (

        <>

          {/* COLLEGE / STUDENT HEADER */}

          <div className="result-college-header">

            <div className="result-avatar">

              {getAvatar(
                selectedStudent.gender
              ) ? (

                <img
                  src={getAvatar(
                    selectedStudent.gender
                  )}
                  alt={
                    selectedStudent.studentName
                  }
                  className="student-avatar-image"
                />

              ) : (

                <div className="default-avatar">
                  🎓
                </div>

              )}

            </div>

            <div>

              <h2>
                St. Joseph&apos;s Institute
                of Technology
              </h2>

              <h3>
                III Year Examination
                Final Result
              </h3>

              <p>
                {
                  selectedStudent.studentName
                }
                {" • "}
                {
                  selectedStudent.department
                }
                {" • III Year"}
              </p>

            </div>

          </div>

          {/* =====================================
              CURRENT SEMESTER 5
          ===================================== */}

          <div className="result-section-title-main">

            <GraduationCap size={21} />

            <div>

              <h3>
                Semester 5 - Current Result
              </h3>

              <p>
                Model Exam 40% +
                Semester Exam 60%
              </p>

            </div>

          </div>

          {/* MODEL RESULT */}

          <div className="table-card">

            <div className="table-card-header">

              <h3>
                Model Examination
              </h3>

              <p>
                Internal component
              </p>

            </div>

            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    <th>S.No</th>
                    <th>Subject</th>
                    <th>Mark /100</th>
                    <th>Grade</th>
                    <th>Result</th>
                  </tr>

                </thead>

                <tbody>

                  {modelResults.map(
                    (result, index) => (

                      <tr
                        key={
                          result.subjectName
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {
                            result.subjectName
                          }
                        </td>

                        <td>
                          {result.mark.toFixed(
                            2
                          )}
                        </td>

                        <td>
                          {result.grade}
                        </td>

                        <td>

                          <span
                            className={
                              result.status ===
                              "PASS"
                                ? "pass-badge"
                                : "fail-badge"
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

          {/* SEMESTER 5 FINAL */}

          <div className="table-card">

            <div className="table-card-header">

              <h3>
                Semester 5 Final Result
              </h3>

              <p>
                Model /40 + Semester /60
              </p>

            </div>

            <div className="table-wrapper">

              <table>

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
                    (result, index) => (

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
                          {result.grade}
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
                                ? "pass-badge"
                                : "fail-badge"
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

          {/* CURRENT SUMMARY */}

          <div className="student-result-summary">

            <div className="student-summary-card">

              <BookOpen size={23} />

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

              <Percent size={23} />

              <span>
                Percentage
              </span>

              <strong>
                {percentage.toFixed(2)}%
              </strong>

            </div>

            <div className="student-summary-card">

              <GraduationCap size={23} />

              <span>
                Semester 5 GPA
              </span>

              <strong>
                {currentGpa.toFixed(2)}
              </strong>

            </div>

            <div className="student-summary-card">

              <Award size={23} />

              <span>
                Current CGPA
              </span>

              <strong>
                {currentCgpa.toFixed(2)}
              </strong>

            </div>

            <div className="student-summary-card">

              <Award size={23} />

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
          ===================================== */}

          <div className="previous-semesters-section">

            <div className="previous-semesters-heading">

              <div>

                <h3>
                  Previous Semesters
                </h3>

                <p>
                  Semester 1 to Semester 4
                  academic results
                </p>

              </div>

            </div>

            {loadingPrevious ? (

              <div className="previous-loading">
                Loading previous semester results...
              </div>

            ) : sortedSemesterSummaries.length ===
              0 ? (

              <div className="previous-loading">
                No previous semester
                results available.
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

                      {/* SEMESTER HEADER */}

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

                      {/* EXPANDED RESULT */}

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

                          {/* SEMESTER SUMMARY */}

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

        </>

      )}

    </div>
  );
}

export default Results;