import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  UserCircle,
  LogOut,
  Users,
  BookOpen,
  CalendarDays,
} from "lucide-react";

import API from "../services/api";

function Header({ onLogout }) {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const adminName =
    localStorage.getItem("examAdminName") || "Admin";

  // ==============================
  // LOAD SEARCH DATA
  // ==============================

  useEffect(() => {
    loadSearchData();
  }, []);

  const loadSearchData = async () => {
    try {
      const [
        studentResponse,
        subjectResponse,
        examResponse,
      ] = await Promise.all([
        API.get("/students"),
        API.get("/subjects"),
        API.get("/exams"),
      ]);

      setStudents(studentResponse.data);
      setSubjects(subjectResponse.data);
      setExams(examResponse.data);
    } catch (error) {
      console.error(
        "Global search data loading error:",
        error
      );
    }
  };

  // ==============================
  // CLOSE DROPDOWN OUTSIDE
  // ==============================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // ==============================
  // SUBJECT LOOKUP
  // ==============================

  const getSubject = (subjectId) => {
    return subjects.find(
      (subject) =>
        Number(subject.subjectId) ===
        Number(subjectId)
    );
  };

  // ==============================
  // SEARCH RESULTS
  // ==============================

  const search =
    searchText.trim().toLowerCase();

  const studentResults =
    search === ""
      ? []
      : students
          .filter((student) => {
            return (
              student.studentName
                ?.toLowerCase()
                .includes(search) ||
              student.department
                ?.toLowerCase()
                .includes(search) ||
              String(student.studentId).includes(search) ||
              student.email
                ?.toLowerCase()
                .includes(search)
            );
          })
          .slice(0, 5)
          .map((student) => ({
            id: `student-${student.studentId}`,
            type: "Student",
            title: student.studentName,
            subtitle: `${student.department} • III Year • ID ${student.studentId}`,
            path: "/students",
          }));

  const subjectResults =
    search === ""
      ? []
      : subjects
          .filter((subject) => {
            return (
              subject.subjectName
                ?.toLowerCase()
                .includes(search) ||
              subject.subjectCode
                ?.toLowerCase()
                .includes(search) ||
              subject.department
                ?.toLowerCase()
                .includes(search)
            );
          })
          .slice(0, 5)
          .map((subject) => ({
            id: `subject-${subject.subjectId}`,
            type: "Subject",
            title: subject.subjectName,
            subtitle: `${subject.subjectCode} • ${subject.department}`,
            path: "/subjects",
          }));

  const examResults =
    search === ""
      ? []
      : exams
          .filter((exam) => {
            const subject =
              getSubject(exam.subjectId);

            return (
              exam.examName
                ?.toLowerCase()
                .includes(search) ||
              exam.examDate
                ?.toLowerCase()
                .includes(search) ||
              subject?.subjectName
                ?.toLowerCase()
                .includes(search) ||
              subject?.department
                ?.toLowerCase()
                .includes(search)
            );
          })
          .slice(0, 5)
          .map((exam) => {
            const subject =
              getSubject(exam.subjectId);

            return {
              id: `exam-${exam.examId}`,
              type: "Exam",
              title: exam.examName,
              subtitle: `${
                subject?.subjectName || "Subject"
              } • ${
                subject?.department || ""
              } • ${exam.examDate}`,
              path: "/exams",
            };
          });

  const results = [
    ...studentResults,
    ...subjectResults,
    ...examResults,
  ].slice(0, 10);

  // ==============================
  // ICON
  // ==============================

  const getResultIcon = (type) => {
    if (type === "Student") {
      return <Users size={18} />;
    }

    if (type === "Subject") {
      return <BookOpen size={18} />;
    }

    return <CalendarDays size={18} />;
  };

  // ==============================
  // CLICK SEARCH RESULT
  // ==============================

  const handleResultClick = (result) => {
    navigate(result.path);

    setSearchText("");
    setShowResults(false);
  };

  // ==============================
  // LOGOUT
  // ==============================

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (confirmLogout) {
      onLogout();
    }
  };

  return (
    <header className="top-header">

      {/* LEFT */}

      <div className="header-left">

        <h1>
          3rd Year Examination Management
        </h1>

        <p>
          St. Joseph&apos;s Institute of Technology
        </p>

      </div>

      {/* RIGHT */}

      <div className="header-right">

        {/* GLOBAL SEARCH */}

        <div
          className="global-search"
          ref={searchRef}
        >

          <div className="header-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search students, subjects, exams..."
              value={searchText}
              onFocus={() =>
                setShowResults(true)
              }
              onChange={(event) => {
                setSearchText(
                  event.target.value
                );

                setShowResults(true);
              }}
            />

          </div>

          {/* SEARCH DROPDOWN */}

          {showResults &&
            searchText.trim() !== "" && (

              <div className="search-dropdown">

                {results.length === 0 ? (

                  <div className="search-empty">
                    No matches found
                  </div>

                ) : (

                  results.map((result) => (

                    <button
                      type="button"
                      key={result.id}
                      className="search-result-item"
                      onClick={() =>
                        handleResultClick(
                          result
                        )
                      }
                    >

                      <div className="search-result-icon">
                        {getResultIcon(
                          result.type
                        )}
                      </div>

                      <div className="search-result-info">

                        <strong>
                          {result.title}
                        </strong>

                        <span>
                          {result.subtitle}
                        </span>

                      </div>

                      <div className="search-result-type">
                        {result.type}
                      </div>

                    </button>

                  ))

                )}

              </div>

            )}

        </div>

        {/* NOTIFICATION */}

        <button
          type="button"
          className="header-icon-btn"
          title="Notifications"
        >
          <Bell size={19} />
        </button>

        {/* PROFILE */}

        <div className="header-profile">

          <UserCircle size={38} />

          <div>
            <strong>
              {adminName}
            </strong>

            <span>
              Administrator
            </span>
          </div>

        </div>

        {/* LOGOUT */}

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Logout
        </button>

      </div>

    </header>
  );
}

export default Header;