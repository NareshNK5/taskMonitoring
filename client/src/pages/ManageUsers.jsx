import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const userRole = localStorage.getItem("role");

  const fetchUsers = () => {
    api
      .get("/admin/users/")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Error fetching users:", err);
        alert("Failed to fetch users");
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.password) delete payload.password; // Optional password for update

    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}/update/`, payload);
      } else {
        await api.post("/admin/users/create/", payload);
      }
      setForm({ username: "", email: "", role: "", password: "" });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Error saving user");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/users/${id}/delete/`);
        fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Error deleting user");
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      email: user.email,
      role: user.role,
      password: "",
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setForm({ username: "", email: "", role: "", password: "" });
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

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-white p-4 rounded shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Username"
              required
              className="border px-4 py-2 rounded w-full"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              required
              className="border px-4 py-2 rounded w-full"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
              className="border px-4 py-2 rounded w-full"
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editingUser ? "New Password (optional)" : "Password"}
              className="border px-4 py-2 rounded w-full"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {editingUser ? "Update User" : "Add User"}
            </button>
            {editingUser && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Username</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Role</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-2 px-4 border-b">{user.id}</td>
                  <td className="py-2 px-4 border-b">{user.username}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.role}</td>
                  <td className="py-2 px-4 border-b space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
