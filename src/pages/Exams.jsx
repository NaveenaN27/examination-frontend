import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import API from "../services/api";

function Exams() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    examName: "",
    examDate: "",
    subjectId: "",
  });

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

  const examTypes = [
    "Model Exam",
    "Semester Exam",
    "Semester Practical Exam",
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examResponse, subjectResponse] = await Promise.all([
        API.get("/exams"),
        API.get("/subjects"),
      ]);

      setExams(examResponse.data);
      setSubjects(subjectResponse.data);
    } catch (error) {
      console.error("Error loading exam data:", error);
      alert("Unable to load exams");
    }
  };

  const getSubject = (subjectId) => {
    return subjects.find(
      (subject) => subject.subjectId === subjectId
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      examName: "",
      examDate: "",
      subjectId: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const examData = {
        examName: formData.examName,
        examDate: formData.examDate,
        subjectId: Number(formData.subjectId),
      };

      if (editingId) {
        await API.put(`/exams/${editingId}`, examData);
        alert("Exam updated successfully");
      } else {
        await API.post("/exams", examData);
        alert("Exam added successfully");
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error("Exam save error:", error);
      alert("Unable to save exam");
    }
  };

  const handleEdit = (exam) => {
    setEditingId(exam.examId);

    setFormData({
      examName: exam.examName,
      examDate: exam.examDate,
      subjectId: exam.subjectId,
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/exams/${id}`);
      loadData();
    } catch (error) {
      console.error("Exam delete error:", error);

      alert(
        "Exam cannot be deleted if marks are connected to this exam."
      );
    }
  };

  const filteredExams = exams.filter((exam) => {
    const subject = getSubject(exam.subjectId);

    if (!subject) {
      return false;
    }

    if (selectedDepartment === "ALL") {
      return true;
    }

    return subject.department === selectedDepartment;
  });

  const filteredSubjectsForForm =
    selectedDepartment === "ALL"
      ? subjects
      : subjects.filter(
          (subject) =>
            subject.department === selectedDepartment
        );

  return (
    <div className="exams-page">

      <div className="page-heading">

        <div>
          <h2>Exams</h2>
          <p>Manage examination schedule</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setEditingId(null);

            setFormData({
              examName: "",
              examDate: "",
              subjectId: "",
            });

            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add Exam
        </button>

      </div>

      <div className="filter-bar">

        <label>Department</label>

        <select
          value={selectedDepartment}
          onChange={(event) =>
            setSelectedDepartment(event.target.value)
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

      {showForm && (
        <div className="form-card">

          <div className="form-card-header">

            <h3>
              {editingId ? "Edit Exam" : "Add Exam"}
            </h3>

            <button
              className="close-button"
              onClick={resetForm}
            >
              <X size={20} />
            </button>

          </div>

          <form
            className="student-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">

              <label>Exam Type</label>

              <select
                name="examName"
                value={formData.examName}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Exam
                </option>

                {examTypes.map((examType) => (
                  <option
                    key={examType}
                    value={examType}
                  >
                    {examType}
                  </option>
                ))}

              </select>

            </div>

            <div className="form-group">

              <label>Subject</label>

              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Subject
                </option>

                {filteredSubjectsForForm.map(
                  (subject) => (
                    <option
                      key={subject.subjectId}
                      value={subject.subjectId}
                    >
                      {subject.subjectCode} -{" "}
                      {subject.subjectName} (
                      {subject.department})
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="form-group">

              <label>Exam Date</label>

              <input
                type="date"
                name="examDate"
                value={formData.examDate}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                {editingId
                  ? "Update Exam"
                  : "Add Exam"}
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="table-card">

        <div className="table-card-header">
          <div>
            <h3>Exam Schedule</h3>

            <p>
              Showing {filteredExams.length} exams
            </p>
          </div>
        </div>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Exam ID</th>
                <th>Department</th>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Exam Type</th>
                <th>Exam Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredExams.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="empty-table"
                  >
                    No exams found
                  </td>
                </tr>

              ) : (

                filteredExams.map((exam) => {
                  const subject = getSubject(
                    exam.subjectId
                  );

                  return (
                    <tr key={exam.examId}>

                      <td>{exam.examId}</td>

                      <td>
                        <span className="department-badge">
                          {subject?.department}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {subject?.subjectCode}
                        </strong>
                      </td>

                      <td>
                        {subject?.subjectName}
                      </td>

                      <td>
                        <span className="exam-badge">
                          {exam.examName}
                        </span>
                      </td>

                      <td>
                        {exam.examDate}
                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEdit(exam)
                            }
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDelete(exam.examId)
                            }
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

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
  );
}

export default Exams;