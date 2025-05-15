import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
    assigned_to: "",
    status: "PENDING",
  });
  const userRole = localStorage.getItem("role");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users/");
      const user = res.data.filter(
        (user) => user.role === 'User'
      );
      setUsers(user);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get("/admin/tasks/");
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    };

    if (
      !payload.title ||
      !payload.description ||
      !payload.due_date ||
      !payload.assigned_to
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (editingTask) {
        await api.put(`/admin/tasks/${editingTask.id}/update/`, payload);
      } else {
        await api.post("/admin/tasks/create/", payload);
      }

      setForm({
        title: "",
        description: "",
        due_date: "",
        assigned_to: "",
        status: "PENDING",
      });
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      assigned_to: task.assigned_to,
      status: task.status,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/admin/tasks/${id}/delete/`);
        fetchTasks();
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setForm({
      title: "",
      description: "",
      due_date: "",
      assigned_to: "",
      status: "PENDING",
    });
  };
  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      await api.post("/auth/logout/", { refresh }); // Only needed if blacklisting
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/"; // Or use navigate("/login") if using React Router
    } catch (error) {
      alert("Logout failed");
    }
  };
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-8">{userRole} Panel</h2>
        <ul>
          <li>
            <a
              href="/admin"
              className="block py-2 px-4 hover:bg-gray-700"
            >
              Dashboard
            </a>
          </li>
          {userRole.toLowerCase() === "superadmin" && (
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
      <main className="flex-1 p-6 overflow-auto">
        <h2 className="text-2xl font-semibold mb-4">Task Management</h2>

        {/* Task Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-white p-4 rounded shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="border px-4 py-2 rounded w-full"
            />

            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
              className="border px-4 py-2 rounded w-full"
            />

            <input
              type="date"
              placeholder="Due Date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              required
              className="border px-4 py-2 rounded w-full"
            />

            <select
              value={form.assigned_to}
              onChange={(e) =>
                setForm({ ...form, assigned_to: e.target.value })
              }
              required
              className="border px-4 py-2 rounded w-full"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border px-4 py-2 rounded w-full"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {editingTask ? "Update Task" : "Create Task"}
            </button>
            {editingTask && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Task Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Title</th>
                <th className="py-2 px-4 border-b text-left">Description</th>
                <th className="py-2 px-4 border-b text-left">Due Date</th>
                <th className="py-2 px-4 border-b text-left">Assigned To</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="py-2 px-4 border-b">{task.id}</td>
                    <td className="py-2 px-4 border-b">{task.title}</td>
                    <td className="py-2 px-4 border-b">{task.description}</td>
                    <td className="py-2 px-4 border-b">{task.due_date}</td>
                    <td className="py-2 px-4 border-b">{task.assigned_to}</td>
                    <td className="py-2 px-4 border-b capitalize">
                      {task.status.replace("_", " ")}
                    </td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
