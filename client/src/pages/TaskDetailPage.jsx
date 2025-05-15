import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function TaskDetailPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [form, setForm] = useState({ status: "", completion_report: "", worked_hours: "" });
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/tasks/")
      .then(res => {
        const selected = res.data.find(t => t.id === parseInt(id));
        if (selected) {
          setTask(selected);
          setForm({ status: selected.status || "", completion_report: selected.completion_report || "", worked_hours: selected.worked_hours || "" });
        } else {
          alert("Task not found");
          navigate("/user");
        }
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    api.put(`/tasks/${id}/update/`, form)
      .then(() => {
        alert("Task updated");
        navigate("/user");
      })
      .catch(err => {
        alert("Error: " + JSON.stringify(err.response.data));
      });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (!task) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Update Task: {task.title}</h2>
      <label>Status:</label>
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
      {form.status === "Completed" && (
        <>
          <label>Completion Report:</label>
          <textarea name="completion_report" value={form.completion_report} onChange={handleChange} />
          <label>Worked Hours:</label>
          <input type="number" step="0.1" name="worked_hours" value={form.worked_hours} onChange={handleChange} />
        </>
      )}
      <button type="submit">Update Task</button>
    </form>
  );
}
