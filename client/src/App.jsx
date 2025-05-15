import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import UserHome from "./pages/UserHome";
import TaskDetailPage from "./pages/TaskDetailPage";
import AdminHome from "./pages/AdminHome";
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "./App.css";
import ManageUsers from "./pages/ManageUsers";
import AdminTasks from "./pages/AdminTasks";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/user" element={<UserHome />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/manage-users" element={<ManageUsers />} />
        <Route path="/admin/tasks" element={<AdminTasks />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
      </Routes>
    </Router>
  );
}
