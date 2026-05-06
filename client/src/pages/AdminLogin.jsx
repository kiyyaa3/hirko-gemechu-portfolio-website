import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { apiRequest } from "../lib/api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin));
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-icon"><Lock size={26} /></div>
        <p className="eyebrow">Admin Login</p>
        <h1>Manage Portfolio</h1>
        <p>Log in to add projects, upload images, update content, and control featured work.</p>
        {error ? <div className="alert error">{error}</div> : null}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="admin@hirko.dev"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          placeholder="Your admin password"
          required
        />
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <a className="text-link" href="/">Back to portfolio</a>
      </form>
    </main>
  );
}
