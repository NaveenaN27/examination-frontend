import { useEffect, useState } from "react";
import { Save, FilePenLine } from "lucide-react";
import API from "../services/api";

function Marks() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [marks, setMarks] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [examId, setExamId] = useState("");
  const [markValue, setMarkValue] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
        API.get("/marks"),
      ]);

      setStudents(studentResponse.data);
      setSubjects(subjectResponse.data);
      setExams(examResponse.data);
      setMarks(markResponse.data);
    } catch (error) {
      console.error("Error loading marks page:", error);
      setMessage("Unable to load data");
    }
  };

  const selectedStudent = students.find(
    (student) => student.studentId === Number(studentId)
  );

  const departmentSubjects = selectedStudent
    ? subjects.filter(
        (subject) =>
          subject.department === selectedStudent.department
      )
    : [];

  const departmentSubjectIds = departmentSubjects.map(
    (subject) => subject.subjectId
  );

  const departmentExams = exams.filter((exam) =>
    departmentSubjectIds.includes(exam.subjectId)
  );

  const getSubject = (subjectId) => {
    return subjects.find(
      (subject) => subject.subjectId === subjectId
    );
  };

  const selectedStudentMarks = marks.filter(
    (mark) => mark.studentId === Number(studentId)
  );

  const handleStudentChange = (event) => {
    setStudentId(event.target.value);
    setExamId("");
    setMarkValue("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!studentId || !examId || markValue === "") {
      setMessage("Please fill all fields");
      return;
    }

    const numericMark = Number(markValue);

    if (numericMark < 0 || numericMark > 100) {
      setMessage("Marks must be between 0 and 100");
      return;
    }

    try {
      await API.post(
        "/marks/enter",
        null,
        {
          params: {
            studentId: Number(studentId),
            examId: Number(examId),
            marks: numericMark,
          },
        }
      );

      setMessage("Marks saved successfully");
      setExamId("");
      setMarkValue("");

      const markResponse = await API.get("/marks");
      setMarks(markResponse.data);

    } catch (error) {
      console.error("Marks save error:", error);
      setMessage("Unable to save marks");
    }
  };

  return (
    <div className="marks-page">

      <div className="page-heading">
        <div>
          <h2>Enter Marks</h2>
          <p>
            Enter or update student examination marks
          </p>
        </div>
      </div>

      <div className="marks-layout">

        <div className="form-card marks-form-card">

          <div className="form-card-header">
            <div>
              <h3>
                <FilePenLine size={20} />
                Mark Entry
              </h3>
              <p>
                Result status will be calculated automatically
              </p>
            </div>
          </div>

          <form
            className="marks-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">
              <label>Student</label>

              <select
                value={studentId}
                onChange={handleStudentChange}
                required
              >
                <option value="">
                  Select Student
                </option>

                {students.map((student) => (
                  <option
                    key={student.studentId}
                    value={student.studentId}
                  >
                    {student.studentId} -{" "}
                    {student.studentName} (
                    {student.department})
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="student-info-box">

                <div>
                  <span>Student</span>
                  <strong>
                    {selectedStudent.studentName}
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
                    {selectedStudent.year}
                  </strong>
                </div>

              </div>
            )}

            <div className="form-group">
              <label>Exam</label>

              <select
                value={examId}
                onChange={(event) =>
                  setExamId(event.target.value)
                }
                disabled={!studentId}
                required
              >
                <option value="">
                  {studentId
                    ? "Select Exam"
                    : "Select Student First"}
                </option>

                {departmentExams.map((exam) => {
                  const subject = getSubject(
                    exam.subjectId
                  );

                  return (
                    <option
                      key={exam.examId}
                      value={exam.examId}
                    >
                      {subject?.subjectCode} -{" "}
                      {subject?.subjectName} -{" "}
                      {exam.examName}
                    </option>
                  );
                })}

              </select>
            </div>

            <div className="form-group">
              <label>Marks Obtained</label>

              <input
                type="number"
                min="0"
                max="100"
                value={markValue}
                onChange={(event) =>
                  setMarkValue(event.target.value)
                }
                placeholder="Enter marks"
                required
              />
            </div>

            {message && (
              <div className="form-message">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="primary-button full-button"
            >
              <Save size={18} />
              Save Marks
            </button>

          </form>
        </div>

        <div className="table-card marks-table-card">

          <div className="table-card-header">
            <div>
              <h3>Student Marks</h3>

              <p>
                {selectedStudent
                  ? `${selectedStudent.studentName} - ${selectedStudent.department}`
                  : "Select a student to view marks"}
              </p>
            </div>
          </div>

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Exam</th>
                  <th>Marks</th>
                  <th>Result</th>
                </tr>
              </thead>

              <tbody>

                {!studentId ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="empty-table"
                    >
                      Select a student
                    </td>
                  </tr>
                ) : selectedStudentMarks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="empty-table"
                    >
                      No marks found
                    </td>
                  </tr>
                ) : (
                  selectedStudentMarks.map((mark) => {

                    const exam = exams.find(
                      (item) =>
                        item.examId === mark.examId
                    );

                    const subject = exam
                      ? getSubject(exam.subjectId)
                      : null;

                    return (
                      <tr key={mark.markId}>

                        <td>
                          <strong>
                            {subject?.subjectName}
                          </strong>
                        </td>

                        <td>
                          {exam?.examName}
                        </td>

                        <td>
                          {mark.marksObtained}
                        </td>

                        <td>
                          <span
                            className={
                              mark.resultStatus === "PASS"
                                ? "result-badge pass"
                                : "result-badge fail"
                            }
                          >
                            {mark.resultStatus}
                          </span>
                        </td>

                      </tr>
                    );
                  })
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Marks;