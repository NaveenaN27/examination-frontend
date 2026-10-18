import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import API from "../services/api";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    subjectCode: "",
    subjectName: "",
    department: "",
    maxMarks: 100,
    passMarks: 40,
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

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const response = await API.get("/subjects");
      setSubjects(response.data);
    } catch (error) {
      console.error("Error loading subjects:", error);
      alert("Unable to load subjects");
    }
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
      subjectCode: "",
      subjectName: "",
      department: "",
      maxMarks: 100,
      passMarks: 40,
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const subjectData = {
        subjectCode: formData.subjectCode,
        subjectName: formData.subjectName,
        department: formData.department,
        maxMarks: Number(formData.maxMarks),
        passMarks: Number(formData.passMarks),
      };

      if (editingId) {
        await API.put(`/subjects/${editingId}`, subjectData);
        alert("Subject updated successfully");
      } else {
        await API.post("/subjects", subjectData);
        alert("Subject added successfully");
      }

      resetForm();
      loadSubjects();
    } catch (error) {
      console.error("Subject save error:", error);
      alert("Unable to save subject");
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject.subjectId);

    setFormData({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      department: subject.department,
      maxMarks: subject.maxMarks,
      passMarks: subject.passMarks,
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/subjects/${id}`);
      loadSubjects();
    } catch (error) {
      console.error("Delete error:", error);

      alert(
        "Subject cannot be deleted if exams are already connected to this subject."
      );
    }
  };

  const filteredSubjects =
    selectedDepartment === "ALL"
      ? subjects
      : subjects.filter(
          (subject) => subject.department === selectedDepartment
        );

  return (
    <div className="subjects-page">

      <div className="page-heading">

        <div>
          <h2>Subjects</h2>
          <p>Manage department-wise subjects</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setEditingId(null);

            setFormData({
              subjectCode: "",
              subjectName: "",
              department: "",
              maxMarks: 100,
              passMarks: 40,
            });

            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add Subject
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
          <option value="ALL">All Departments</option>

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
              {editingId ? "Edit Subject" : "Add Subject"}
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
              <label>Subject Code</label>

              <input
                type="text"
                name="subjectCode"
                value={formData.subjectCode}
                onChange={handleChange}
                placeholder="Example: CSE301"
                required
              />
            </div>

            <div className="form-group">
              <label>Subject Name</label>

              <input
                type="text"
                name="subjectName"
                value={formData.subjectName}
                onChange={handleChange}
                placeholder="Enter subject name"
                required
              />
            </div>

            <div className="form-group">
              <label>Department</label>

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Department
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

            <div className="form-group">
              <label>Maximum Marks</label>

              <input
                type="number"
                name="maxMarks"
                value={formData.maxMarks}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Pass Marks</label>

              <input
                type="number"
                name="passMarks"
                value={formData.passMarks}
                onChange={handleChange}
                min="1"
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
                {editingId ? "Update Subject" : "Add Subject"}
              </button>

            </div>

          </form>

        </div>
      )}

      <div className="table-card">

        <div className="table-card-header">

          <div>
            <h3>Subject List</h3>

            <p>
              Showing {filteredSubjects.length} subjects
            </p>
          </div>

        </div>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Department</th>
                <th>Max Marks</th>
                <th>Pass Marks</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredSubjects.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="empty-table"
                  >
                    No subjects found
                  </td>
                </tr>

              ) : (

                filteredSubjects.map((subject) => (

                  <tr key={subject.subjectId}>

                    <td>{subject.subjectId}</td>

                    <td>
                      <strong>
                        {subject.subjectCode}
                      </strong>
                    </td>

                    <td>{subject.subjectName}</td>

                    <td>
                      <span className="department-badge">
                        {subject.department}
                      </span>
                    </td>

                    <td>{subject.maxMarks}</td>

                    <td>{subject.passMarks}</td>

                    <td>
                      <div className="action-buttons">

                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(subject)
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(subject.subjectId)
                          }
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Subjects;