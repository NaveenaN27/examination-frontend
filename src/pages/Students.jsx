import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
} from "lucide-react";

import API from "../services/api";

import femaleAvatar from "../assets/female-graduate-avatar.png";
import maleAvatar from "../assets/male-graduate-avatar.png";

function Students() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("ALL");

  const [formData, setFormData] = useState({
    studentName: "",
    department: "CSE",
    year: 3,
    email: "",
    gender: "",
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
    loadStudents();
  }, []);

  // =========================================
  // LOAD STUDENTS
  // =========================================

  const loadStudents = async () => {
    try {
      const response = await API.get("/students");

      setStudents(response.data);
    } catch (error) {
      console.error(
        "Students loading error:",
        error
      );
    }
  };

  // =========================================
  // INPUT CHANGE
  // =========================================

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData({
      ...formData,

      [name]:
        name === "year"
          ? Number(value)
          : value,
    });
  };

  // =========================================
  // ADD / UPDATE STUDENT
  // =========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await API.put(
          `/students/${editingId}`,
          formData
        );

        alert(
          "Student updated successfully"
        );
      } else {
        await API.post(
          "/students",
          formData
        );

        alert(
          "Student added successfully"
        );
      }

      resetForm();
      loadStudents();

    } catch (error) {
      console.error(
        "Student save error:",
        error
      );

      alert(
        "Unable to save student. Check entered details."
      );
    }
  };

  // =========================================
  // EDIT STUDENT
  // =========================================

  const handleEdit = (student) => {
    setEditingId(
      student.studentId
    );

    setFormData({
      studentName:
        student.studentName,

      department:
        student.department,

      year:
        student.year,

      email:
        student.email,

      gender:
        student.gender === "Male" ||
        student.gender === "Female"
          ? student.gender
          : "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================
  // DELETE STUDENT
  // =========================================

  const handleDelete = async (
    studentId
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this student?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(
        `/students/${studentId}`
      );

      alert(
        "Student deleted successfully"
      );

      loadStudents();

    } catch (error) {
      console.error(
        "Student delete error:",
        error
      );

      alert(
        "Student cannot be deleted because marks may already exist."
      );
    }
  };

  // =========================================
  // RESET FORM
  // =========================================

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);

    setFormData({
      studentName: "",
      department: "CSE",
      year: 3,
      email: "",
      gender: "",
    });
  };

  // =========================================
  // STUDENT AVATAR
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
  // SEARCH + FILTER
  // =========================================

  const filteredStudents =
    students.filter(
      (student) => {

        const search =
          searchText
            .trim()
            .toLowerCase();

        const searchMatch =
          (student.studentName || "")
            .toLowerCase()
            .includes(search) ||

          (student.email || "")
            .toLowerCase()
            .includes(search) ||

          String(
            student.studentId
          ).includes(search);

        const departmentMatch =
          selectedDepartment ===
            "ALL" ||
          student.department ===
            selectedDepartment;

        return (
          searchMatch &&
          departmentMatch
        );
      }
    );

  return (
    <div className="students-page">

      {/* =====================================
          PAGE HEADING
      ===================================== */}

      <div className="page-heading">

        <div>
          <h2>
            III Year Students
          </h2>

          <p>
            Manage student information
            and department details
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus size={18} />

          Add Student
        </button>

      </div>

      {/* =====================================
          ADD / EDIT FORM
      ===================================== */}

      {showForm && (

        <div className="form-card">

          <div className="form-card-header">

            <div>

              <h3>
                {editingId
                  ? "Edit Student"
                  : "Add Student"}
              </h3>

              <p>
                Enter III Year
                student details
              </p>

            </div>

            <button
              type="button"
              className="close-button"
              onClick={resetForm}
            >
              <X size={18} />
            </button>

          </div>

          <form
            className="student-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="form-group">

              <label>
                Student Name
              </label>

              <input
                type="text"
                name="studentName"
                value={
                  formData.studentName
                }
                onChange={
                  handleChange
                }
                placeholder="Enter student name"
                required
              />

            </div>

            {/* DEPARTMENT */}

            <div className="form-group">

              <label>
                Department
              </label>

              <select
                name="department"
                value={
                  formData.department
                }
                onChange={
                  handleChange
                }
                required
              >

                {departments.map(
                  (department) => (

                    <option
                      key={
                        department
                      }
                      value={
                        department
                      }
                    >
                      {department}
                    </option>

                  )
                )}

              </select>

            </div>

            {/* YEAR */}

            <div className="form-group">

              <label>
                Year
              </label>

              <select
                name="year"
                value={
                  formData.year
                }
                onChange={
                  handleChange
                }
                required
              >
                <option value={3}>
                  III Year
                </option>
              </select>

            </div>

            {/* GENDER */}

            <div className="form-group">

              <label>
                Gender
              </label>

              <select
                name="gender"
                value={
                  formData.gender
                }
                onChange={
                  handleChange
                }
                required
              >

                <option value="">
                  Select Gender
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Male">
                  Male
                </option>

              </select>

            </div>

            {/* EMAIL */}

            <div className="form-group">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                placeholder="Enter email address"
                required
              />

            </div>

            {/* FORM BUTTONS */}

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={
                  resetForm
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                {editingId
                  ? "Update Student"
                  : "Add Student"}
              </button>

            </div>

          </form>

        </div>

      )}

      {/* =====================================
          SEARCH + DEPARTMENT FILTER
      ===================================== */}

      <div className="filter-bar">

        <div
          className="header-search"
          style={{
            width: "320px",
          }}
        >

          <Search size={18} />

          <input
            type="text"
            placeholder="Search name, ID or email..."
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
          />

        </div>

        <div className="filter-group">

          <label>
            Department
          </label>

          <select
            value={
              selectedDepartment
            }
            onChange={(event) =>
              setSelectedDepartment(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Departments
            </option>

            {departments.map(
              (department) => (

                <option
                  key={
                    department
                  }
                  value={
                    department
                  }
                >
                  {department}
                </option>

              )
            )}

          </select>

        </div>

      </div>

      {/* =====================================
          STUDENT TABLE
      ===================================== */}

      <div className="table-card">

        <div className="table-card-header">

          <h3>
            Student List
          </h3>

          <p>
            Showing{" "}
            {
              filteredStudents.length
            }{" "}
            of {students.length} students
          </p>

        </div>

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                {/* Avatar heading intentionally blank */}
                <th></th>

                <th>
                  Student ID
                </th>

                <th>Name</th>

                <th>Gender</th>

                <th>
                  Department
                </th>

                <th>Year</th>

                <th>Email</th>

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {filteredStudents.length ===
              0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="empty-table"
                  >
                    No students found
                  </td>

                </tr>

              ) : (

                filteredStudents.map(
                  (student) => {

                    const avatar =
                      getAvatar(
                        student.gender
                      );

                    return (

                      <tr
                        key={
                          student.studentId
                        }
                      >

                        {/* IMAGE AVATAR */}

                        <td>

                          <div className="student-list-avatar">

                            {avatar ? (

                              <img
                                src={
                                  avatar
                                }
                                alt={`${student.studentName} avatar`}
                              />

                            ) : (

                              <div className="student-avatar-fallback">
                                🎓
                              </div>

                            )}

                          </div>

                        </td>

                        {/* STUDENT ID */}

                        <td>
                          #
                          {
                            student.studentId
                          }
                        </td>

                        {/* NAME */}

                        <td>

                          <strong>
                            {
                              student.studentName
                            }
                          </strong>

                        </td>

                        {/* GENDER */}

                        <td>
                          {student.gender &&
                          student.gender !==
                            "Not Set"
                            ? student.gender
                            : "-"}
                        </td>

                        {/* DEPARTMENT */}

                        <td>

                          <span className="department-badge">
                            {
                              student.department
                            }
                          </span>

                        </td>

                        {/* YEAR */}

                        <td>
                          III Year
                        </td>

                        {/* EMAIL */}

                        <td>
                          {
                            student.email
                          }
                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="action-buttons">

                            <button
                              type="button"
                              className="edit-button"
                              title="Edit Student"
                              onClick={() =>
                                handleEdit(
                                  student
                                )
                              }
                            >
                              <Pencil
                                size={16}
                              />
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              title="Delete Student"
                              onClick={() =>
                                handleDelete(
                                  student.studentId
                                )
                              }
                            >
                              <Trash2
                                size={16}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Students;