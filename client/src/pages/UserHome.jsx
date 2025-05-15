import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function UserHomePage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks/");
        setTasks(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/");
        } else {
          alert("Failed to fetch tasks.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = { ...selectedTask };

      // Convert worked_hours to number if present
      if (payload.worked_hours !== undefined) {
        payload.worked_hours = parseFloat(payload.worked_hours);
      }

      const response = await api.put(`/tasks/${selectedTask.id}/update/`, payload);
      setTasks((prev) =>
        prev.map((task) => (task.id === selectedTask.id ? response.data : task))
      );
      setSelectedTask(null);
    } catch (error) {
      alert("Failed to update task.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
        <nav className="flex flex-col space-y-4">
          <button
            onClick={() => navigate("/user-home")}
            className="hover:bg-gray-700 p-2 rounded text-left transition"
          >
            Tasks
          </button>
          <button
            onClick={handleLogout}
            className="hover:bg-gray-700 p-2 rounded text-left transition"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">My Tasks</h2>

        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="p-4 bg-gray-100 rounded shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-gray-600">Status: {task.status}</p>
                    <p className="text-sm text-gray-600">Description: {task.description}</p>
                    <p className="text-sm text-gray-600">Due Date: {task.due_date}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTask({ ...task })}
                    className="text-blue-500 hover:underline"
                  >
                    View / Update
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Edit Task Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Update Task</h3>
              <form onSubmit={handleUpdateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={selectedTask.title}
                    onChange={(e) =>
                      setSelectedTask({ ...selectedTask, title: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) =>
                      setSelectedTask({ ...selectedTask, status: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {/* Conditionally show completion report and worked hours */}
                {selectedTask.status === "COMPLETED" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium">Completion Report</label>
                      <textarea
                        value={selectedTask.completion_report || ""}
                        onChange={(e) =>
                          setSelectedTask({ ...selectedTask, completion_report: e.target.value })
                        }
                        className="w-full border px-3 py-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Worked Hours</label>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedTask.worked_hours || ""}
                        onChange={(e) =>
                          setSelectedTask({ ...selectedTask, worked_hours: e.target.value })
                        }
                        className="w-full border px-3 py-2 rounded"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      updating ||
                      (selectedTask.status === "COMPLETED" &&
                        (!selectedTask.completion_report || !selectedTask.worked_hours))
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    {updating ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
