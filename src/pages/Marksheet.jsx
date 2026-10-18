import { useEffect, useState } from "react";
import { Printer, FileText } from "lucide-react";
import API from "../services/api";

import femaleAvatar from "../assets/female-graduate-avatar.png";
import maleAvatar from "../assets/male-graduate-avatar.png";

function Marksheet() {
  const [students, setStudents] = useState([]);
  const [markDetails, setMarkDetails] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // =========================================
  // LOAD DATA
  // =========================================

  const loadData = async () => {
    try {
      const [studentResponse, marksResponse] =
        await Promise.all([
          API.get("/students"),
          API.get("/marks/details"),
        ]);

      setStudents(studentResponse.data);
      setMarkDetails(marksResponse.data);
    } catch (error) {
      console.error("Marksheet loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SELECTED STUDENT
  // =========================================

  const selectedStudent = students.find(
    (student) =>
      Number(student.studentId) ===
      Number(selectedStudentId)
  );

  const studentRecords = selectedStudent
    ? markDetails.filter(
        (record) =>
          record[0] === selectedStudent.studentName &&
          record[1] === selectedStudent.department
      )
    : [];

  // =========================================
  // AVATAR
  // =========================================

  const getAvatar = (gender) => {
    if (gender === "Female") {
      return femaleAvatar;
    }

    if (gender === "Male") {
      return maleAvatar;
    }

    return null;
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
  // SEMESTER FINAL RESULT
  // MODEL 40% + SEMESTER 60%
  // =========================================

  const semesterResults = studentRecords
    .filter(
      (record) =>
        record[3] === "Semester Exam"
    )
    .map((semesterRecord) => {
      const subjectName =
        semesterRecord[2];

      const modelRecord =
        studentRecords.find(
          (record) =>
            record[2] === subjectName &&
            record[3] === "Model Exam"
        );

      const modelMark = modelRecord
        ? Number(modelRecord[4])
        : 0;

      const semesterMark =
        Number(semesterRecord[4]);

      // Model /100 -> /40
      const modelConverted =
        (modelMark * 40) / 100;

      // Semester /100 -> /60
      const semesterConverted =
        (semesterMark * 60) / 100;

      // Final /100
      const finalScore =
        modelConverted +
        semesterConverted;

      const status =
        finalScore >= 40
          ? "PASS"
          : "FAIL";

      const grade =
        status === "PASS"
          ? calculateGrade(finalScore)
          : "F";

      const gradePoint =
        status === "PASS"
          ? calculateGradePoint(finalScore)
          : 0;

      return {
        subjectName,
        modelMark,
        modelConverted,
        semesterMark,
        semesterConverted,
        finalScore,
        status,
        grade,
        gradePoint,
      };
    });

  // =========================================
  // TOTAL
  // =========================================

  const total =
    semesterResults.reduce(
      (sum, result) =>
        sum + result.finalScore,
      0
    );

  const maximumTotal =
    semesterResults.length * 100;

  // =========================================
  // PERCENTAGE
  // =========================================

  const percentage =
    maximumTotal > 0
      ? (total / maximumTotal) * 100
      : 0;

  // =========================================
  // OVERALL RESULT
  // =========================================

  const overallPass =
    semesterResults.length > 0 &&
    semesterResults.every(
      (result) =>
        result.status === "PASS"
    );

  // =========================================
  // GPA
  // =========================================

  const totalGradePoints =
    semesterResults.reduce(
      (sum, result) =>
        sum + result.gradePoint,
      0
    );

  const gpa =
    semesterResults.length > 0
      ? totalGradePoints /
        semesterResults.length
      : 0;

  // =========================================
  // OVERALL GRADE
  // =========================================

  const overallGrade =
    overallPass
      ? calculateGrade(percentage)
      : "F";

  // =========================================
  // PRINT
  // =========================================

  const handlePrint = () => {
    window.print();
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="loading-message">
        Loading marksheet...
      </div>
    );
  }

  return (
    <div className="marksheet-page">

      {/* PAGE HEADING */}

      <div className="page-heading no-print">
        <div>
          <h2>Student Marksheet</h2>

          <p>
            View and print III Year examination marksheet
          </p>
        </div>
      </div>

      {/* STUDENT SELECT */}

      <div className="filter-bar no-print">

        <div className="filter-group">

          <label>Select Student</label>

          <select
            value={selectedStudentId}
            onChange={(event) =>
              setSelectedStudentId(
                event.target.value
              )
            }
          >

            <option value="">
              Select Student
            </option>

            {students.map((student) => (
              <option
                key={student.studentId}
                value={student.studentId}
              >
                {student.studentName}
                {" - "}
                {student.department}
              </option>
            ))}

          </select>

        </div>

      </div>

      {!selectedStudent ? (

        <div className="table-card">

          <div className="empty-table">
            Select a student to generate marksheet
          </div>

        </div>

      ) : (

        <>
          {/* PRINT BUTTON */}

          <div
            className="no-print"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "18px",
            }}
          >

            <button
              type="button"
              className="primary-button"
              onClick={handlePrint}
            >
              <Printer size={18} />
              Print / Save PDF
            </button>

          </div>

          {/* =====================================
              MARKSHEET
          ===================================== */}

          <div className="marksheet-card">

            {/* COLLEGE HEADER */}

            <div className="marksheet-title">

              <FileText size={36} />

              <h1>
                St. Joseph&apos;s Institute of Technology
              </h1>

              <h2>
                III Year Examination Marksheet
              </h2>

              <p>
                Model Exam 40% + Semester Exam 60%
              </p>

            </div>

            {/* STUDENT AVATAR */}

            <div className="marksheet-avatar-area">

              <div className="result-avatar">

                {getAvatar(selectedStudent.gender) ? (

                  <img
                    src={getAvatar(
                      selectedStudent.gender
                    )}
                    alt={`${selectedStudent.studentName} avatar`}
                    className="student-avatar-image"
                  />

                ) : (

                  <span className="default-avatar">
                    🎓
                  </span>

                )}

              </div>

            </div>

            {/* STUDENT INFORMATION */}

            <div className="marksheet-student-info">

              <div>
                <span>Student Name</span>

                <strong>
                  {selectedStudent.studentName}
                </strong>
              </div>

              <div>
                <span>Student ID</span>

                <strong>
                  {selectedStudent.studentId}
                </strong>
              </div>

              <div>
                <span>Department</span>

                <strong>
                  {selectedStudent.department}
                </strong>
              </div>

              <div>
                <span>Year</span>

                <strong>
                  III Year
                </strong>
              </div>

            </div>

            {/* =====================================
                MARK TABLE
            ===================================== */}

            <div className="table-wrapper">

              <table className="marksheet-table">

                <thead>
                  <tr>
                    <th>S.No</th>

                    <th>Subject</th>

                    <th>
                      Model /100
                    </th>

                    <th>
                      Model /40
                    </th>

                    <th>
                      Semester /100
                    </th>

                    <th>
                      Semester /60
                    </th>

                    <th>
                      Final /100
                    </th>

                    <th>Grade</th>

                    <th>GP</th>

                    <th>Result</th>
                  </tr>
                </thead>

                <tbody>

                  {semesterResults.length === 0 ? (

                    <tr>
                      <td
                        colSpan="10"
                        className="empty-table"
                      >
                        No semester results found
                      </td>
                    </tr>

                  ) : (

                    semesterResults.map(
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
                            {result.modelMark}
                          </td>

                          <td>
                            {result.modelConverted.toFixed(
                              2
                            )}
                          </td>

                          <td>
                            {result.semesterMark}
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
                            <strong>
                              {result.grade}
                            </strong>
                          </td>

                          <td>
                            {
                              result.gradePoint
                            }
                          </td>

                          <td>
                            <span
                              className={`result-badge ${
                                result.status ===
                                "PASS"
                                  ? "pass"
                                  : "fail"
                              }`}
                            >
                              {result.status}
                            </span>
                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

            {/* =====================================
                FINAL SUMMARY
            ===================================== */}

            <div className="marksheet-summary">

              <div>
                <span>Total</span>

                <strong>
                  {total.toFixed(2)}
                  {" / "}
                  {maximumTotal}
                </strong>
              </div>

              <div>
                <span>Percentage</span>

                <strong>
                  {percentage.toFixed(2)}%
                </strong>
              </div>

              <div>
                <span>GPA</span>

                <strong>
                  {gpa.toFixed(2)} / 10
                </strong>
              </div>

              <div>
                <span>Grade</span>

                <strong>
                  {overallGrade}
                </strong>
              </div>

              <div>
                <span>Result</span>

                <strong>
                  {overallPass
                    ? "PASS"
                    : "FAIL"}
                </strong>
              </div>

            </div>

            {/* =====================================
                SIGNATURES
            ===================================== */}

            <div className="marksheet-footer">

              {/* CLASS COORDINATOR */}

              <div className="signature-box">

                <div className="signature-name">
                  A. Kavitha
                </div>

                <div className="signature-line"></div>

                <strong>
                  Class Coordinator
                </strong>

                <span>
                  III Year
                </span>

              </div>

              {/* HOD */}

              <div className="signature-box">

                <div className="signature-name">
                  R. Suresh
                </div>

                <div className="signature-line"></div>

                <strong>
                  Head of Department
                </strong>

                <span>
                  Department of{" "}
                  {selectedStudent.department}
                </span>

              </div>

            </div>

          </div>

        </>
      )}

    </div>
  );
}

export default Marksheet;