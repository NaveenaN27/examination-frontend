import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  FilePenLine,
  ClipboardCheck,
  TrendingUp,
  GraduationCap,
  Trophy,
  FileText,
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={19} />,
    },
    {
      name: "Students",
      path: "/students",
      icon: <Users size={19} />,
    },
    {
      name: "Subjects",
      path: "/subjects",
      icon: <BookOpen size={19} />,
    },
    {
      name: "Exams",
      path: "/exams",
      icon: <CalendarDays size={19} />,
    },
    {
      name: "Enter Marks",
      path: "/marks",
      icon: <FilePenLine size={19} />,
    },
    {
      name: "Final Results",
      path: "/results",
      icon: <ClipboardCheck size={19} />,
    },
    {
      name: "Rankings",
      path: "/rankings",
      icon: <Trophy size={19} />,
    },
    {
      name: "Marksheet",
      path: "/marksheet",
      icon: <FileText size={19} />,
    },
    {
      name: "Above Average",
      path: "/above-average",
      icon: <TrendingUp size={19} />,
    },
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <div className="logo-icon">
          <GraduationCap size={27} />
        </div>

        <div>
          <h2>ExamFlow</h2>
          <p>III Year Exam Management</p>
        </div>
      </div>

      <nav className="sidebar-menu">

        {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <span className="sidebar-link-icon">
              {item.icon}
            </span>

            <span>{item.name}</span>
          </NavLink>

        ))}

      </nav>

      <div className="sidebar-footer">
        <p>3rd Year Examination</p>
        <span>Academic Management Portal</span>
      </div>

    </aside>
  );
}

export default Sidebar;