import { useEffect, useState } from "react";
import api from "../api/axios";

const AdminHomePage = () => {
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  const [tasks, setTasks] = useState([]);
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    // Fetch dashboard stats
    api
      .get("/admin/dashboard/")
      .then((res) => setTaskStats(res.data))
      .catch(() => alert("Failed to load dashboard data"));

    // Fetch all completed tasks
    api
      .get("/admin/task/complete/")  // Make sure your backend supports GET here for list
      .then((res) =>
        setTasks(res.data))
      .catch(() => alert("Failed to load completed tasks"));
  }, []);
  console.log("tasks",tasks)

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      await api.post("/auth/logout/", { refresh });
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("role");
      window.location.href = "/";
    } catch (error) {
      alert("Logout failed");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-8">{userRole} Panel</h2>
        <ul>
          <li>
            <a href="/admin" className="block py-2 px-4 hover:bg-gray-700">
              Dashboard
            </a>
          </li>
          {userRole?.toLowerCase() === "superadmin" && (
            <li>
              <a
                href="/admin/manage-users"
                className="block py-2 px-4 hover:bg-gray-700"
              >
                Manage Users
              </a>
            </li>
          )}
          <li>
            <a
              href="/admin/tasks"
              className="block py-2 px-4 hover:bg-gray-700"
            >
              Tasks
            </a>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 px-4 hover:bg-gray-700"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-xl mb-4">Task Overview</h3>
            <p>Total Tasks: {taskStats.total}</p>
            <p>Pending: {taskStats.pending}</p>
            <p>In Progress: {taskStats.inProgress}</p>
            <p>Completed: {taskStats.completed}</p>
          </div>
        </div>

        {/* Completed Task Reports */}
        {tasks.length > 0 && (
          <div className="mt-10">
            <h3 className="text-2xl font-semibold mb-4">Completed Task Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white p-4 rounded shadow">
                  <h4 className="text-lg font-semibold">{task.title}</h4>
                  <p>
                    <strong>Assigned To:</strong> {task.assigned_to}
                  </p>
                  <p>
                    <strong>Worked Hours:</strong> {task.worked_hours}
                  </p>
                  <p>
                    <strong>Report:</strong> {task.completion_report}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHomePage;
