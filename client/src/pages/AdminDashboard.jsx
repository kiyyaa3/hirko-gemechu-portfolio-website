import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileUp,
  FolderKanban,
  Inbox,
  KeyRound,
  LayoutTemplate,
  LogOut,
  MessageSquareQuote,
  Newspaper,
  Plus,
  Save,
  ShieldCheck,
  Trash2
} from "lucide-react";
import { authHeaders, apiRequest, assetUrl } from "../lib/api.js";
import ChatWidget from "../components/ChatWidget.jsx";

const emptyProjectForm = {
  title: "",
  category: "",
  description: "",
  technologies: "",
  liveUrl: "",
  repoUrl: "",
  featured: true,
  sortOrder: 0,
  image: null
};

const emptyFileForm = {
  title: "",
  description: "",
  category: "Document",
  public: true,
  sortOrder: 0,
  file: null
};

const emptyPostForm = {
  title: "",
  excerpt: "",
  body: "",
  tags: "",
  published: true,
  publishedAt: "",
  sortOrder: 0,
  image: null
};

const emptyTestimonialForm = {
  name: "",
  role: "",
  quote: "",
  type: "testimonial",
  public: true,
  sortOrder: 0,
  file: null
};

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

const emptyKnowledgeForm = {
  question: "",
  answer: "",
  category: "General",
  sourceUrl: "",
  aliases: "",
  public: true,
  sortOrder: 0
};

const adminSections = [
  { id: "content", label: "Content", icon: LayoutTemplate },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "files", label: "Files", icon: FileUp },
  { id: "posts", label: "Blog", icon: Newspaper },
  { id: "knowledge", label: "Q&A", icon: MessageSquareQuote },
  { id: "testimonials", label: "Proof", icon: MessageSquareQuote },
  { id: "messages", label: "Messages", icon: Inbox },
  { id: "security", label: "Security", icon: KeyRound }
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("content");
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [content, setContent] = useState(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [fileForm, setFileForm] = useState(emptyFileForm);
  const [postForm, setPostForm] = useState(emptyPostForm);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonialForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [knowledgeForm, setKnowledgeForm] = useState(emptyKnowledgeForm);
  const [contentFiles, setContentFiles] = useState({ heroImage: null, heroVideo: null, logo: null, downloadFiles: {} });
  const [editingProjectId, setEditingProjectId] = useState("");
  const [editingPostId, setEditingPostId] = useState("");
  const [editingTestimonialId, setEditingTestimonialId] = useState("");
  const [editingKnowledgeId, setEditingKnowledgeId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const admin = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser") || "{}");
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    loadAdminData().catch((err) => setError(err.message));
  }, []);

  async function loadAdminData() {
    const [projectData, assetData, messageData, chatData, contentData, postData, testimonialData, knowledgeData] = await Promise.all([
      apiRequest("/api/projects"),
      apiRequest("/api/assets?all=true"),
      apiRequest("/api/messages", { headers: authHeaders() }),
      apiRequest("/api/chat", { headers: authHeaders() }),
      apiRequest("/api/content"),
      apiRequest("/api/posts?all=true"),
      apiRequest("/api/testimonials?all=true"),
      apiRequest("/api/knowledge?all=true", { headers: authHeaders() })
    ]);

    setProjects(projectData);
    setAssets(assetData);
    setMessages(messageData);
    setChatMessages(chatData);
    setContent(contentData);
    setPosts(postData);
    setTestimonials(testimonialData);
    setKnowledgeEntries(knowledgeData);
  }

  function clearFeedback() {
    setStatus("");
    setError("");
  }

  function resetProjectForm() {
    setEditingProjectId("");
    setProjectForm(emptyProjectForm);
  }

  function resetPostForm() {
    setEditingPostId("");
    setPostForm(emptyPostForm);
  }

  function resetTestimonialForm() {
    setEditingTestimonialId("");
    setTestimonialForm(emptyTestimonialForm);
  }

  function resetKnowledgeForm() {
    setEditingKnowledgeId("");
    setKnowledgeForm(emptyKnowledgeForm);
  }

  function startProjectEdit(project) {
    setEditingProjectId(project._id);
    setProjectForm({
      title: project.title || "",
      category: project.category || "",
      description: project.description || "",
      technologies: project.technologies?.join(", ") || "",
      liveUrl: project.liveUrl || "",
      repoUrl: project.repoUrl || "",
      featured: Boolean(project.featured),
      sortOrder: project.sortOrder || 0,
      image: null
    });
    setActiveSection("projects");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startPostEdit(post) {
    setEditingPostId(post._id);
    setPostForm({
      title: post.title || "",
      excerpt: post.excerpt || "",
      body: post.body || "",
      tags: post.tags?.join(", ") || "",
      published: Boolean(post.published),
      publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : "",
      sortOrder: post.sortOrder || 0,
      image: null
    });
    setActiveSection("posts");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startTestimonialEdit(item) {
    setEditingTestimonialId(item._id);
    setTestimonialForm({
      name: item.name || "",
      role: item.role || "",
      quote: item.quote || "",
      type: item.type || "testimonial",
      public: Boolean(item.public),
      sortOrder: item.sortOrder || 0,
      file: null
    });
    setActiveSection("testimonials");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startKnowledgeEdit(entry) {
    setEditingKnowledgeId(entry._id);
    setKnowledgeForm({
      question: entry.question || "",
      answer: entry.answer || "",
      category: entry.category || "General",
      sourceUrl: entry.sourceUrl || "",
      aliases: entry.aliases?.join(", ") || "",
      public: Boolean(entry.public),
      sortOrder: entry.sortOrder || 0
    });
    setActiveSection("knowledge");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveContent(event) {
    event.preventDefault();
    clearFeedback();

    try {
      const payload = new FormData();
      [
        "headerTitle",
        "headerSubtitle",
        "heroTitle",
        "heroBody",
        "announcementText",
        "primaryButtonLabel",
        "primaryButtonUrl",
        "secondaryButtonLabel",
        "secondaryButtonUrl",
        "availabilityText",
        "heroImageUrl",
        "heroVideoUrl",
        "logoUrl",
        "aboutTitle",
        "aboutBody",
        "aboutNote",
        "highlightTitle",
        "highlightBody",
        "servicesTitle",
        "skillsTitle",
        "experienceTitle",
        "experienceBody",
        "testimonialsTitle",
        "projectsTitle",
        "downloadsTitle",
        "blogTitle",
        "contactTitle",
        "contactBody",
        "footerText",
        "email",
        "phone",
        "location"
      ].forEach((field) => payload.append(field, content[field] || ""));

      ["links", "heroStats", "services", "skillGroups", "publicDownloads", "highlightItems"].forEach((field) => {
        payload.append(field, JSON.stringify(content[field] || []));
      });

      if (contentFiles.heroImage) payload.append("heroImage", contentFiles.heroImage);
      if (contentFiles.heroVideo) payload.append("heroVideo", contentFiles.heroVideo);
      if (contentFiles.logo) payload.append("logo", contentFiles.logo);
      (content.publicDownloads || []).slice(0, 3).forEach((_download, index) => {
        const file = contentFiles.downloadFiles[index];
        if (file) payload.append(`downloadFile${index}`, file);
      });

      const saved = await apiRequest("/api/content", {
        method: "PUT",
        headers: authHeaders(),
        body: payload
      });
      setContent(saved);
      setContentFiles({ heroImage: null, heroVideo: null, logo: null, downloadFiles: {} });
      setStatus("Website content updated.");
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveProject(event) {
    event.preventDefault();
    clearFeedback();

    try {
      const payload = new FormData();
      Object.entries(projectForm).forEach(([key, value]) => {
        if (key === "image" && value) payload.append("image", value);
        if (key !== "image") payload.append(key, value);
      });

      await apiRequest(editingProjectId ? `/api/projects/${editingProjectId}` : "/api/projects", {
        method: editingProjectId ? "PUT" : "POST",
        headers: authHeaders(),
        body: payload
      });

      setStatus(editingProjectId ? "Project updated." : "Project added.");
      resetProjectForm();
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function savePost(event) {
    event.preventDefault();
    clearFeedback();

    try {
      const payload = new FormData();
      Object.entries(postForm).forEach(([key, value]) => {
        if (key === "image" && value) payload.append("image", value);
        if (key !== "image") payload.append(key, value);
      });

      await apiRequest(editingPostId ? `/api/posts/${editingPostId}` : "/api/posts", {
        method: editingPostId ? "PUT" : "POST",
        headers: authHeaders(),
        body: payload
      });

      setStatus(editingPostId ? "Blog post updated." : "Blog post published.");
      resetPostForm();
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveTestimonial(event) {
    event.preventDefault();
    clearFeedback();

    try {
      const payload = new FormData();
      Object.entries(testimonialForm).forEach(([key, value]) => {
        if (key === "file" && value) payload.append("file", value);
        if (key !== "file") payload.append(key, value);
      });

      await apiRequest(editingTestimonialId ? `/api/testimonials/${editingTestimonialId}` : "/api/testimonials", {
        method: editingTestimonialId ? "PUT" : "POST",
        headers: authHeaders(),
        body: payload
      });

      setStatus(editingTestimonialId ? "Testimonial updated." : "Testimonial added.");
      resetTestimonialForm();
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveKnowledge(event) {
    event.preventDefault();
    clearFeedback();

    try {
      await apiRequest(editingKnowledgeId ? `/api/knowledge/${editingKnowledgeId}` : "/api/knowledge", {
        method: editingKnowledgeId ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(knowledgeForm)
      });

      setStatus(editingKnowledgeId ? "Q&A entry updated." : "Q&A entry added.");
      resetKnowledgeForm();
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function uploadFile(event) {
    event.preventDefault();
    clearFeedback();

    try {
      const payload = new FormData();
      Object.entries(fileForm).forEach(([key, value]) => {
        if (key === "file" && value) payload.append("file", value);
        if (key !== "file") payload.append(key, value);
      });

      await apiRequest("/api/assets", {
        method: "POST",
        headers: authHeaders(),
        body: payload
      });

      setFileForm(emptyFileForm);
      setStatus("File uploaded.");
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    clearFeedback();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      await apiRequest("/api/auth/password", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      setPasswordForm(emptyPasswordForm);
      setStatus("Admin password changed.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateMessage(messageId, statusValue) {
    clearFeedback();

    try {
      await apiRequest(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: statusValue })
      });
      setStatus(`Message marked ${statusValue}.`);
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeItem(path, successMessage, confirmText) {
    const confirmed = window.confirm(confirmText);
    if (!confirmed) return;

    clearFeedback();

    try {
      await apiRequest(path, {
        method: "DELETE",
        headers: authHeaders()
      });
      setStatus(successMessage);
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/admin/login";
  }

  const newMessageCount = messages.filter((message) => message.status === "new").length;
  const publicAssetCount = assets.filter((asset) => asset.public).length;
  const heroPreviewUrl = contentFiles.heroImage ? URL.createObjectURL(contentFiles.heroImage) : assetUrl(content?.heroImageUrl);
  const heroVideoPreviewUrl = contentFiles.heroVideo ? URL.createObjectURL(contentFiles.heroVideo) : assetUrl(content?.heroVideoUrl);
  const logoPreviewUrl = contentFiles.logo ? URL.createObjectURL(contentFiles.logo) : assetUrl(content?.logoUrl);

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Portfolio CMS</h1>
          <p>Signed in as {admin.email || "admin"} and ready to manage content, files, blog posts, proof, and contact requests.</p>
        </div>
        <div className="admin-actions">
          <Link className="btn secondary" to="/">View Site</Link>
          <button className="btn danger" type="button" onClick={logout}><LogOut size={17} /> Logout</button>
        </div>
      </header>

      <section className="admin-summary">
        <article className="summary-card">
          <span>{projects.length}</span>
          <p>Projects</p>
        </article>
        <article className="summary-card">
          <span>{posts.length}</span>
          <p>Posts</p>
        </article>
        <article className="summary-card">
          <span>{publicAssetCount}</span>
          <p>Public Downloads</p>
        </article>
        <article className="summary-card">
          <span>{newMessageCount}</span>
          <p>New Messages</p>
        </article>
      </section>

      <section className="admin-section-nav">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              className={`admin-nav-chip ${activeSection === section.id ? "active" : ""}`}
              type="button"
              onClick={() => setActiveSection(section.id)}
            >
              <Icon size={16} />
              {section.label}
            </button>
          );
        })}
      </section>

      {status ? <div className="admin-feedback success">{status}</div> : null}
      {error ? <div className="admin-feedback error">{error}</div> : null}

      <section className="admin-grid">
        <div className="admin-stack">
          {activeSection === "content" && content ? (
            <form className="admin-form admin-panel" onSubmit={saveContent}>
              <div className="form-heading">
                <LayoutTemplate size={24} />
                <div>
                  <h2>Website Content</h2>
                  <p>Manage the homepage copy, footer, contact details, and external links.</p>
                </div>
              </div>
              <label>Header Name</label>
              <input value={content.headerTitle || ""} onChange={(event) => setContent({ ...content, headerTitle: event.target.value })} />
              <label>Header Subtitle</label>
              <input value={content.headerSubtitle || ""} onChange={(event) => setContent({ ...content, headerSubtitle: event.target.value })} />
              <label>Hero Title</label>
              <input value={content.heroTitle || ""} onChange={(event) => setContent({ ...content, heroTitle: event.target.value })} />
              <label>Hero Body</label>
              <textarea rows="4" value={content.heroBody || ""} onChange={(event) => setContent({ ...content, heroBody: event.target.value })} />
              <label>Announcement Banner</label>
              <input value={content.announcementText || ""} onChange={(event) => setContent({ ...content, announcementText: event.target.value })} />
              <label>Availability Text</label>
              <input value={content.availabilityText || ""} onChange={(event) => setContent({ ...content, availabilityText: event.target.value })} />
              <div className="admin-subsection">
                <h3>Hero Buttons</h3>
                <div className="two-fields">
                  <div>
                    <label>Primary Button Label</label>
                    <input value={content.primaryButtonLabel || ""} onChange={(event) => setContent({ ...content, primaryButtonLabel: event.target.value })} />
                  </div>
                  <div>
                    <label>Primary Button URL</label>
                    <input value={content.primaryButtonUrl || ""} onChange={(event) => setContent({ ...content, primaryButtonUrl: event.target.value })} placeholder="#projects or https://..." />
                  </div>
                </div>
                <div className="two-fields">
                  <div>
                    <label>Secondary Button Label</label>
                    <input value={content.secondaryButtonLabel || ""} onChange={(event) => setContent({ ...content, secondaryButtonLabel: event.target.value })} />
                  </div>
                  <div>
                    <label>Secondary Button URL</label>
                    <input value={content.secondaryButtonUrl || ""} onChange={(event) => setContent({ ...content, secondaryButtonUrl: event.target.value })} placeholder="#contact or https://..." />
                  </div>
                </div>
              </div>
              <div className="two-fields">
                <div>
                  <label>Hero Image URL</label>
                  <input value={content.heroImageUrl || ""} onChange={(event) => setContent({ ...content, heroImageUrl: event.target.value })} />
                </div>
                <div>
                  <label>Hero Video URL</label>
                  <input value={content.heroVideoUrl || ""} onChange={(event) => setContent({ ...content, heroVideoUrl: event.target.value })} placeholder="https://...mp4" />
                </div>
              </div>
              <label>Logo URL</label>
              <input value={content.logoUrl || ""} onChange={(event) => setContent({ ...content, logoUrl: event.target.value })} />
              <div className="two-fields">
                <label className="upload-box">
                  <LayoutTemplate size={22} />
                  <span>{contentFiles.heroImage ? `Ready to publish: ${contentFiles.heroImage.name}` : "Upload new hero image"}</span>
                  <input
                    name="heroImage"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setContentFiles({ ...contentFiles, heroImage: event.target.files?.[0] || null })}
                  />
                </label>
                <label className="upload-box">
                  <LayoutTemplate size={22} />
                  <span>{contentFiles.heroVideo ? `Ready to publish: ${contentFiles.heroVideo.name}` : "Upload local hero video"}</span>
                  <input
                    name="heroVideo"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(event) => setContentFiles({ ...contentFiles, heroVideo: event.target.files?.[0] || null })}
                  />
                </label>
              </div>
              <div className="two-fields">
                <label className="upload-box">
                  <LayoutTemplate size={22} />
                  <span>{contentFiles.logo ? `Ready to publish: ${contentFiles.logo.name}` : "Upload new logo"}</span>
                  <input
                    name="logo"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setContentFiles({ ...contentFiles, logo: event.target.files?.[0] || null })}
                  />
                </label>
              </div>
              <div className="media-preview-grid">
                <article className="media-preview-card">
                  <span>{contentFiles.heroImage ? "Selected hero image" : "Current hero image"}</span>
                  {heroPreviewUrl ? <img src={heroPreviewUrl} alt="Current hero" /> : <div className="admin-placeholder">No hero image</div>}
                  <p>{contentFiles.heroImage ? "Click Save & Publish Content to update the Hero Image URL." : (content.heroImageUrl || "No saved hero image URL")}</p>
                </article>
                <article className="media-preview-card">
                  <span>{contentFiles.heroVideo ? "Selected hero video" : "Current hero video"}</span>
                  {heroVideoPreviewUrl ? (
                    <video src={heroVideoPreviewUrl} controls muted playsInline />
                  ) : <div className="admin-placeholder">No hero video</div>}
                  <p>{contentFiles.heroVideo ? "Click Save & Publish Content to upload this video." : (content.heroVideoUrl || "No saved hero video URL")}</p>
                </article>
                <article className="media-preview-card">
                  <span>{contentFiles.logo ? "Selected logo" : "Current logo"}</span>
                  {logoPreviewUrl ? <img src={logoPreviewUrl} alt="Current logo" /> : <div className="admin-placeholder">No logo</div>}
                  <p>{contentFiles.logo ? "Click Save & Publish Content to update the Logo URL." : (content.logoUrl || "No saved logo URL")}</p>
                </article>
              </div>
              <div className="admin-subsection">
                <h3>Hero Stats</h3>
                {(content.heroStats || []).map((stat, index) => (
                  <div className="three-fields" key={`hero-stat-${index}`}>
                    <input
                      value={stat.value || ""}
                      placeholder="Value"
                      onChange={(event) => {
                        const heroStats = [...(content.heroStats || [])];
                        heroStats[index] = { ...heroStats[index], value: event.target.value };
                        setContent({ ...content, heroStats });
                      }}
                    />
                    <input
                      value={stat.label || ""}
                      placeholder="Label"
                      onChange={(event) => {
                        const heroStats = [...(content.heroStats || [])];
                        heroStats[index] = { ...heroStats[index], label: event.target.value };
                        setContent({ ...content, heroStats });
                      }}
                    />
                    <button className="btn secondary" type="button" onClick={() => setContent({ ...content, heroStats: (content.heroStats || []).filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
                  </div>
                ))}
                <button className="btn secondary" type="button" onClick={() => setContent({ ...content, heroStats: [...(content.heroStats || []), { value: "", label: "" }] })}>Add Stat</button>
              </div>
              <label>About Title</label>
              <input value={content.aboutTitle || ""} onChange={(event) => setContent({ ...content, aboutTitle: event.target.value })} />
              <label>About Body</label>
              <textarea rows="4" value={content.aboutBody || ""} onChange={(event) => setContent({ ...content, aboutBody: event.target.value })} />
              <label>About Second Paragraph</label>
              <textarea rows="3" value={content.aboutNote || ""} onChange={(event) => setContent({ ...content, aboutNote: event.target.value })} />
              <div className="admin-subsection">
                <h3>Featured Highlight</h3>
                <label>Highlight Title</label>
                <input value={content.highlightTitle || ""} onChange={(event) => setContent({ ...content, highlightTitle: event.target.value })} />
                <label>Highlight Body</label>
                <textarea rows="3" value={content.highlightBody || ""} onChange={(event) => setContent({ ...content, highlightBody: event.target.value })} />
                <label>Highlight Items, comma separated</label>
                <input
                  value={(content.highlightItems || []).join(", ")}
                  onChange={(event) => setContent({
                    ...content,
                    highlightItems: event.target.value.split(",").map((item) => item.trim()).filter(Boolean)
                  })}
                  placeholder="Fast delivery, Clean UI, Reliable support"
                />
              </div>
              <div className="admin-subsection">
                <h3>Services</h3>
                <label>Services Section Title</label>
                <input value={content.servicesTitle || ""} onChange={(event) => setContent({ ...content, servicesTitle: event.target.value })} />
                {(content.services || []).map((service, index) => (
                  <div className="repeat-editor" key={`service-${index}`}>
                    <div className="two-fields">
                      <div>
                        <label>Service Title</label>
                        <input
                          value={service.title || ""}
                          onChange={(event) => {
                            const services = [...(content.services || [])];
                            services[index] = { ...services[index], title: event.target.value };
                            setContent({ ...content, services });
                          }}
                        />
                      </div>
                      <div>
                        <label>Icon</label>
                        <select
                          value={service.icon || "Laptop"}
                          onChange={(event) => {
                            const services = [...(content.services || [])];
                            services[index] = { ...services[index], icon: event.target.value };
                            setContent({ ...content, services });
                          }}
                        >
                          {["Laptop", "Database", "ShieldCheck", "Briefcase", "Code2", "Server", "Wrench"].map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                        </select>
                      </div>
                    </div>
                    <label>Service Description</label>
                    <textarea
                      rows="3"
                      value={service.description || ""}
                      onChange={(event) => {
                        const services = [...(content.services || [])];
                        services[index] = { ...services[index], description: event.target.value };
                        setContent({ ...content, services });
                      }}
                    />
                    <button className="btn secondary" type="button" onClick={() => setContent({ ...content, services: (content.services || []).filter((_, itemIndex) => itemIndex !== index) })}>Remove Service</button>
                  </div>
                ))}
                <button className="btn secondary" type="button" onClick={() => setContent({ ...content, services: [...(content.services || []), { title: "", description: "", icon: "Laptop" }] })}>Add Service</button>
              </div>
              <div className="admin-subsection">
                <h3>Skills & Experience</h3>
                <label>Skills Section Title</label>
                <input value={content.skillsTitle || ""} onChange={(event) => setContent({ ...content, skillsTitle: event.target.value })} />
                {(content.skillGroups || []).map((group, index) => (
                  <div className="repeat-editor" key={`skill-${index}`}>
                    <div className="two-fields">
                      <div>
                        <label>Skill Group Title</label>
                        <input
                          value={group.title || ""}
                          onChange={(event) => {
                            const skillGroups = [...(content.skillGroups || [])];
                            skillGroups[index] = { ...skillGroups[index], title: event.target.value };
                            setContent({ ...content, skillGroups });
                          }}
                        />
                      </div>
                      <div>
                        <label>Icon</label>
                        <select
                          value={group.icon || "Code2"}
                          onChange={(event) => {
                            const skillGroups = [...(content.skillGroups || [])];
                            skillGroups[index] = { ...skillGroups[index], icon: event.target.value };
                            setContent({ ...content, skillGroups });
                          }}
                        >
                          {["Code2", "Server", "Wrench", "Laptop", "Database", "ShieldCheck", "Briefcase"].map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                        </select>
                      </div>
                    </div>
                    <label>Skills, comma separated</label>
                    <input
                      value={(group.items || []).join(", ")}
                      onChange={(event) => {
                        const skillGroups = [...(content.skillGroups || [])];
                        skillGroups[index] = {
                          ...skillGroups[index],
                          items: event.target.value.split(",").map((item) => item.trim()).filter(Boolean)
                        };
                        setContent({ ...content, skillGroups });
                      }}
                    />
                    <button className="btn secondary" type="button" onClick={() => setContent({ ...content, skillGroups: (content.skillGroups || []).filter((_, itemIndex) => itemIndex !== index) })}>Remove Skill Group</button>
                  </div>
                ))}
                <button className="btn secondary" type="button" onClick={() => setContent({ ...content, skillGroups: [...(content.skillGroups || []), { title: "", icon: "Code2", items: [] }] })}>Add Skill Group</button>
                <label>Experience Card Title</label>
                <input value={content.experienceTitle || ""} onChange={(event) => setContent({ ...content, experienceTitle: event.target.value })} />
                <label>Experience Card Body</label>
                <textarea rows="4" value={content.experienceBody || ""} onChange={(event) => setContent({ ...content, experienceBody: event.target.value })} />
              </div>
              <div className="two-fields">
                <div>
                  <label>Email</label>
                  <input value={content.email || ""} onChange={(event) => setContent({ ...content, email: event.target.value })} />
                </div>
                <div>
                  <label>Phone</label>
                  <input value={content.phone || ""} onChange={(event) => setContent({ ...content, phone: event.target.value })} />
                </div>
              </div>
              <label>Location</label>
              <input value={content.location || ""} onChange={(event) => setContent({ ...content, location: event.target.value })} />
              <label>Footer Text</label>
              <input value={content.footerText || ""} onChange={(event) => setContent({ ...content, footerText: event.target.value })} />
              <div className="admin-subsection">
                <h3>Section Headings</h3>
                <label>Testimonials Title</label>
                <input value={content.testimonialsTitle || ""} onChange={(event) => setContent({ ...content, testimonialsTitle: event.target.value })} />
                <label>Projects Title</label>
                <input value={content.projectsTitle || ""} onChange={(event) => setContent({ ...content, projectsTitle: event.target.value })} />
                <label>Downloads Title</label>
                <input value={content.downloadsTitle || ""} onChange={(event) => setContent({ ...content, downloadsTitle: event.target.value })} />
                <label>Blog Title</label>
                <input value={content.blogTitle || ""} onChange={(event) => setContent({ ...content, blogTitle: event.target.value })} />
                <label>Contact Title</label>
                <input value={content.contactTitle || ""} onChange={(event) => setContent({ ...content, contactTitle: event.target.value })} />
                <label>Contact Body</label>
                <textarea rows="3" value={content.contactBody || ""} onChange={(event) => setContent({ ...content, contactBody: event.target.value })} />
              </div>
              <div className="admin-subsection">
                <h3>Homepage Downloads</h3>
                {(content.publicDownloads || []).map((download, index) => (
                  <div className="repeat-editor" key={`download-${index}`}>
                    <div className="two-fields">
                      <div>
                        <label>Download Title</label>
                        <input
                          value={download.title || ""}
                          onChange={(event) => {
                            const publicDownloads = [...(content.publicDownloads || [])];
                            publicDownloads[index] = { ...publicDownloads[index], title: event.target.value };
                            setContent({ ...content, publicDownloads });
                          }}
                        />
                      </div>
                      <div>
                        <label>Category</label>
                        <input
                          value={download.category || ""}
                          onChange={(event) => {
                            const publicDownloads = [...(content.publicDownloads || [])];
                            publicDownloads[index] = { ...publicDownloads[index], category: event.target.value };
                            setContent({ ...content, publicDownloads });
                          }}
                        />
                      </div>
                    </div>
                    <label>Description</label>
                    <textarea
                      rows="2"
                      value={download.description || ""}
                      onChange={(event) => {
                        const publicDownloads = [...(content.publicDownloads || [])];
                        publicDownloads[index] = { ...publicDownloads[index], description: event.target.value };
                        setContent({ ...content, publicDownloads });
                      }}
                    />
                    <label>File URL</label>
                    <input
                      value={download.fileUrl || ""}
                      onChange={(event) => {
                        const publicDownloads = [...(content.publicDownloads || [])];
                        publicDownloads[index] = { ...publicDownloads[index], fileUrl: event.target.value };
                        setContent({ ...content, publicDownloads });
                      }}
                    />
                    {index < 3 ? (
                      <label className="upload-box">
                        <FileUp size={22} />
                        <span>{contentFiles.downloadFiles[index]?.name || "Upload replacement file"}</span>
                        <input
                          name={`downloadFile${index}`}
                          type="file"
                          onChange={(event) => setContentFiles({
                            ...contentFiles,
                            downloadFiles: {
                              ...contentFiles.downloadFiles,
                              [index]: event.target.files?.[0] || null
                            }
                          })}
                        />
                      </label>
                    ) : null}
                    <button className="btn secondary" type="button" onClick={() => setContent({ ...content, publicDownloads: (content.publicDownloads || []).filter((_, itemIndex) => itemIndex !== index) })}>Remove Download</button>
                  </div>
                ))}
                <button className="btn secondary" type="button" onClick={() => setContent({ ...content, publicDownloads: [...(content.publicDownloads || []), { title: "", description: "", category: "", fileUrl: "" }] })}>Add Download</button>
              </div>
              <label>External Links</label>
              {(content.links || []).map((link, index) => (
                <div className="three-fields" key={`link-${index}`}>
                  <input
                    value={link.label || ""}
                    placeholder="Label"
                    onChange={(event) => {
                      const links = [...(content.links || [])];
                      links[index] = { ...links[index], label: event.target.value };
                      setContent({ ...content, links });
                    }}
                  />
                  <input
                    value={link.url || ""}
                    placeholder="URL"
                    onChange={(event) => {
                      const links = [...(content.links || [])];
                      links[index] = { ...links[index], url: event.target.value };
                      setContent({ ...content, links });
                    }}
                  />
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => {
                      const links = (content.links || []).filter((_, itemIndex) => itemIndex !== index);
                      setContent({ ...content, links });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="form-buttons">
                <button className="btn secondary" type="button" onClick={() => setContent({ ...content, links: [...(content.links || []), { label: "", url: "" }] })}>Add Link</button>
                <button className="btn primary" type="submit"><Save size={16} /> Save & Publish Content</button>
              </div>
            </form>
          ) : null}

          {activeSection === "projects" && (
            <form className="admin-form admin-panel" onSubmit={saveProject}>
              <div className="form-heading">
                {editingProjectId ? <Save size={24} /> : <Plus size={24} />}
                <div>
                  <h2>{editingProjectId ? "Edit Project" : "Add Project"}</h2>
                  <p>Upload a project image, control order, and choose what appears on the public homepage.</p>
                </div>
              </div>
              <label>Project Title</label>
              <input value={projectForm.title} onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })} required />
              <label>Category</label>
              <input value={projectForm.category} onChange={(event) => setProjectForm({ ...projectForm, category: event.target.value })} required />
              <label>Description</label>
              <textarea rows="5" value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} required />
              <label>Technologies</label>
              <input value={projectForm.technologies} onChange={(event) => setProjectForm({ ...projectForm, technologies: event.target.value })} placeholder="React, Node.js, MongoDB" />
              <div className="two-fields">
                <div>
                  <label>Live URL</label>
                  <input value={projectForm.liveUrl} onChange={(event) => setProjectForm({ ...projectForm, liveUrl: event.target.value })} />
                </div>
                <div>
                  <label>Repo URL</label>
                  <input value={projectForm.repoUrl} onChange={(event) => setProjectForm({ ...projectForm, repoUrl: event.target.value })} />
                </div>
              </div>
              <div className="two-fields">
                <label className="check-row">
                  <input type="checkbox" checked={projectForm.featured} onChange={(event) => setProjectForm({ ...projectForm, featured: event.target.checked })} />
                  Featured on homepage
                </label>
                <div>
                  <label>Sort Order</label>
                  <input type="number" value={projectForm.sortOrder} onChange={(event) => setProjectForm({ ...projectForm, sortOrder: event.target.value })} />
                </div>
              </div>
              <label className="upload-box">
                <FolderKanban size={22} />
                <span>{projectForm.image ? projectForm.image.name : "Choose project image"}</span>
                <input type="file" accept="image/*" onChange={(event) => setProjectForm({ ...projectForm, image: event.target.files?.[0] || null })} />
              </label>
              <div className="form-buttons">
                <button className="btn primary" type="submit">{editingProjectId ? "Save Project" : "Add Project"}</button>
                {editingProjectId ? <button className="btn secondary" type="button" onClick={resetProjectForm}>Cancel</button> : null}
              </div>
            </form>
          )}

          {activeSection === "files" && (
            <form className="admin-form admin-panel" onSubmit={uploadFile}>
              <div className="form-heading">
                <FileUp size={24} />
                <div>
                  <h2>Upload Files</h2>
                  <p>Add CVs, PDFs, DOCX files, certificates, or images for download.</p>
                </div>
              </div>
              <label>File Title</label>
              <input value={fileForm.title} onChange={(event) => setFileForm({ ...fileForm, title: event.target.value })} required />
              <label>Description</label>
              <textarea rows="3" value={fileForm.description} onChange={(event) => setFileForm({ ...fileForm, description: event.target.value })} />
              <div className="two-fields">
                <div>
                  <label>Category</label>
                  <input value={fileForm.category} onChange={(event) => setFileForm({ ...fileForm, category: event.target.value })} />
                </div>
                <div>
                  <label>Sort Order</label>
                  <input type="number" value={fileForm.sortOrder} onChange={(event) => setFileForm({ ...fileForm, sortOrder: event.target.value })} />
                </div>
              </div>
              <label className="check-row">
                <input type="checkbox" checked={fileForm.public} onChange={(event) => setFileForm({ ...fileForm, public: event.target.checked })} />
                Public download
              </label>
              <label className="upload-box">
                <FileUp size={22} />
                <span>{fileForm.file ? fileForm.file.name : "Choose PDF, DOCX, image, or document"}</span>
                <input type="file" onChange={(event) => setFileForm({ ...fileForm, file: event.target.files?.[0] || null })} required />
              </label>
              <button className="btn primary" type="submit">Upload File</button>
            </form>
          )}

          {activeSection === "posts" && (
            <form className="admin-form admin-panel" onSubmit={savePost}>
              <div className="form-heading">
                {editingPostId ? <Save size={24} /> : <Newspaper size={24} />}
                <div>
                  <h2>{editingPostId ? "Edit Blog Post" : "Publish Blog Post"}</h2>
                  <p>Share updates, announcements, and technical notes on the public site.</p>
                </div>
              </div>
              <label>Title</label>
              <input value={postForm.title} onChange={(event) => setPostForm({ ...postForm, title: event.target.value })} required />
              <label>Excerpt</label>
              <textarea rows="3" value={postForm.excerpt} onChange={(event) => setPostForm({ ...postForm, excerpt: event.target.value })} required />
              <label>Body</label>
              <textarea rows="7" value={postForm.body} onChange={(event) => setPostForm({ ...postForm, body: event.target.value })} required />
              <label>Tags</label>
              <input value={postForm.tags} onChange={(event) => setPostForm({ ...postForm, tags: event.target.value })} placeholder="MERN, Portfolio, Case Study" />
              <div className="two-fields">
                <div>
                  <label>Publish Date</label>
                  <input type="date" value={postForm.publishedAt} onChange={(event) => setPostForm({ ...postForm, publishedAt: event.target.value })} />
                </div>
                <div>
                  <label>Sort Order</label>
                  <input type="number" value={postForm.sortOrder} onChange={(event) => setPostForm({ ...postForm, sortOrder: event.target.value })} />
                </div>
              </div>
              <label className="check-row">
                <input type="checkbox" checked={postForm.published} onChange={(event) => setPostForm({ ...postForm, published: event.target.checked })} />
                Published
              </label>
              <label className="upload-box">
                <Newspaper size={22} />
                <span>{postForm.image ? postForm.image.name : "Choose blog image"}</span>
                <input type="file" accept="image/*" onChange={(event) => setPostForm({ ...postForm, image: event.target.files?.[0] || null })} />
              </label>
              <div className="form-buttons">
                <button className="btn primary" type="submit">{editingPostId ? "Save Post" : "Publish Post"}</button>
                {editingPostId ? <button className="btn secondary" type="button" onClick={resetPostForm}>Cancel</button> : null}
              </div>
            </form>
          )}

          {activeSection === "testimonials" && (
            <form className="admin-form admin-panel" onSubmit={saveTestimonial}>
              <div className="form-heading">
                {editingTestimonialId ? <Save size={24} /> : <MessageSquareQuote size={24} />}
                <div>
                  <h2>{editingTestimonialId ? "Edit Testimonial / Certificate" : "Add Testimonial / Certificate"}</h2>
                  <p>Show client feedback, certifications, education proof, or credibility highlights.</p>
                </div>
              </div>
              <label>Name or Title</label>
              <input value={testimonialForm.name} onChange={(event) => setTestimonialForm({ ...testimonialForm, name: event.target.value })} required />
              <label>Role or Source</label>
              <input value={testimonialForm.role} onChange={(event) => setTestimonialForm({ ...testimonialForm, role: event.target.value })} />
              <label>Quote or Summary</label>
              <textarea rows="5" value={testimonialForm.quote} onChange={(event) => setTestimonialForm({ ...testimonialForm, quote: event.target.value })} required />
              <div className="two-fields">
                <div>
                  <label>Type</label>
                  <select value={testimonialForm.type} onChange={(event) => setTestimonialForm({ ...testimonialForm, type: event.target.value })}>
                    <option value="testimonial">Testimonial</option>
                    <option value="certificate">Certificate</option>
                  </select>
                </div>
                <div>
                  <label>Sort Order</label>
                  <input type="number" value={testimonialForm.sortOrder} onChange={(event) => setTestimonialForm({ ...testimonialForm, sortOrder: event.target.value })} />
                </div>
              </div>
              <label className="check-row">
                <input type="checkbox" checked={testimonialForm.public} onChange={(event) => setTestimonialForm({ ...testimonialForm, public: event.target.checked })} />
                Public
              </label>
              <label className="upload-box">
                <MessageSquareQuote size={22} />
                <span>{testimonialForm.file ? testimonialForm.file.name : "Choose image or certificate file"}</span>
                <input type="file" onChange={(event) => setTestimonialForm({ ...testimonialForm, file: event.target.files?.[0] || null })} />
              </label>
              <div className="form-buttons">
                <button className="btn primary" type="submit">{editingTestimonialId ? "Save Entry" : "Add Entry"}</button>
                {editingTestimonialId ? <button className="btn secondary" type="button" onClick={resetTestimonialForm}>Cancel</button> : null}
              </div>
            </form>
          )}

          {activeSection === "knowledge" && (
            <form className="admin-form admin-panel" onSubmit={saveKnowledge}>
              <div className="form-heading">
                {editingKnowledgeId ? <Save size={24} /> : <MessageSquareQuote size={24} />}
                <div>
                  <h2>{editingKnowledgeId ? "Edit Chatbot Q&A" : "Add Chatbot Q&A"}</h2>
                  <p>Add exact answers the chatbot should use for customer questions, social links, CV details, services, pricing notes, or policies.</p>
                </div>
              </div>
              <label>Question</label>
              <input value={knowledgeForm.question} onChange={(event) => setKnowledgeForm({ ...knowledgeForm, question: event.target.value })} required />
              <label>Answer</label>
              <textarea rows="6" value={knowledgeForm.answer} onChange={(event) => setKnowledgeForm({ ...knowledgeForm, answer: event.target.value })} required />
              <div className="two-fields">
                <div>
                  <label>Category</label>
                  <input value={knowledgeForm.category} onChange={(event) => setKnowledgeForm({ ...knowledgeForm, category: event.target.value })} placeholder="Social, CV, Services..." />
                </div>
                <div>
                  <label>Source URL</label>
                  <input value={knowledgeForm.sourceUrl} onChange={(event) => setKnowledgeForm({ ...knowledgeForm, sourceUrl: event.target.value })} placeholder="https://..." />
                </div>
              </div>
              <label>Related Questions / Aliases</label>
              <input value={knowledgeForm.aliases} onChange={(event) => setKnowledgeForm({ ...knowledgeForm, aliases: event.target.value })} placeholder="Comma-separated questions visitors may ask" />
              <div className="two-fields">
                <label className="check-row">
                  <input type="checkbox" checked={knowledgeForm.public} onChange={(event) => setKnowledgeForm({ ...knowledgeForm, public: event.target.checked })} />
                  Public for chatbot
                </label>
                <div>
                  <label>Sort Order</label>
                  <input type="number" value={knowledgeForm.sortOrder} onChange={(event) => setKnowledgeForm({ ...knowledgeForm, sortOrder: event.target.value })} />
                </div>
              </div>
              <div className="form-buttons">
                <button className="btn primary" type="submit">{editingKnowledgeId ? "Save Q&A" : "Add Q&A"}</button>
                {editingKnowledgeId ? <button className="btn secondary" type="button" onClick={resetKnowledgeForm}>Cancel</button> : null}
              </div>
            </form>
          )}

          {activeSection === "security" && (
            <form className="admin-form admin-panel" onSubmit={changePassword}>
              <div className="form-heading">
                <ShieldCheck size={24} />
                <div>
                  <h2>Security</h2>
                  <p>Change the admin password before deploying live and anytime you share access.</p>
                </div>
              </div>
              <label>Current Password</label>
              <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} required />
              <label>New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} required />
              <label>Confirm New Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} required />
              <button className="btn primary" type="submit"><KeyRound size={16} /> Change Password</button>
            </form>
          )}
        </div>

        <section className="admin-list admin-panel">
          {activeSection === "projects" && (
            <>
              <h2>Project Library</h2>
              <div className="admin-projects">
                {projects.map((project) => (
                  <article className="admin-project" key={project._id}>
                    {project.imageUrl ? <img src={assetUrl(project.imageUrl)} alt={project.title} /> : <div className="admin-placeholder">No Image</div>}
                    <div>
                      <p className="eyebrow">{project.category}</p>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                      <div className="tag-row">{project.technologies?.map((tech) => <span className="tag" key={tech}>{tech}</span>)}</div>
                      <div className="project-controls">
                        <button className="btn secondary" type="button" onClick={() => startProjectEdit(project)}>Edit</button>
                        <button className="btn danger" type="button" onClick={() => removeItem(`/api/projects/${project._id}`, "Project deleted.", "Delete this project?")}><Trash2 size={16} /> Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {activeSection === "files" && (
            <>
              <h2>Uploaded Files</h2>
              <div className="admin-projects">
                {assets.map((asset) => (
                  <article className="admin-project compact" key={asset._id}>
                    <div className="admin-placeholder">{asset.mimeType?.startsWith("image/") ? "Image" : "File"}</div>
                    <div>
                      <p className="eyebrow">{asset.category} | {asset.public ? "Public" : "Private"}</p>
                      <h3>{asset.title}</h3>
                      <p>{asset.description || asset.fileName}</p>
                      <div className="project-controls">
                        <a className="btn secondary" href={assetUrl(asset.fileUrl)} target="_blank" rel="noreferrer">Open</a>
                        <button className="btn danger" type="button" onClick={() => removeItem(`/api/assets/${asset._id}`, "File deleted.", "Delete this file?")}><Trash2 size={16} /> Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {activeSection === "posts" && (
            <>
              <h2>Published Posts</h2>
              <div className="admin-projects">
                {posts.map((post) => (
                  <article className="admin-project compact" key={post._id}>
                    {post.imageUrl ? <img src={assetUrl(post.imageUrl)} alt={post.title} /> : <div className="admin-placeholder">Post</div>}
                    <div>
                      <p className="eyebrow">{post.published ? "Published" : "Draft"} | {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</p>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <div className="tag-row">{post.tags?.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
                      <div className="project-controls">
                        <button className="btn secondary" type="button" onClick={() => startPostEdit(post)}>Edit</button>
                        <button className="btn danger" type="button" onClick={() => removeItem(`/api/posts/${post._id}`, "Post deleted.", "Delete this blog post?")}><Trash2 size={16} /> Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {activeSection === "testimonials" && (
            <>
              <h2>Testimonials & Certificates</h2>
              <div className="admin-projects">
                {testimonials.map((item) => (
                  <article className="admin-project compact" key={item._id}>
                    {item.imageUrl ? <img src={assetUrl(item.imageUrl)} alt={item.name} /> : <div className="admin-placeholder">{item.type}</div>}
                    <div>
                      <p className="eyebrow">{item.type} | {item.public ? "Public" : "Private"}</p>
                      <h3>{item.name}</h3>
                      <p>{item.quote}</p>
                      <div className="project-controls">
                        <button className="btn secondary" type="button" onClick={() => startTestimonialEdit(item)}>Edit</button>
                        {item.fileUrl ? <a className="btn secondary" href={assetUrl(item.fileUrl)} target="_blank" rel="noreferrer">View File</a> : null}
                        <button className="btn danger" type="button" onClick={() => removeItem(`/api/testimonials/${item._id}`, "Entry deleted.", "Delete this testimonial or certificate?")}><Trash2 size={16} /> Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {activeSection === "knowledge" && (
            <>
              <h2>Chatbot Knowledge Q&A</h2>
              <div className="admin-projects">
                {knowledgeEntries.length ? knowledgeEntries.map((entry) => (
                  <article className="message-card" key={entry._id}>
                    <p className="eyebrow">{entry.category} | {entry.public ? "Public" : "Private"}</p>
                    <h3>{entry.question}</h3>
                    <p>{entry.answer}</p>
                    {entry.aliases?.length ? <p>Related: {entry.aliases.join(", ")}</p> : null}
                    {entry.sourceUrl ? <div className="message-meta"><a href={entry.sourceUrl} target="_blank" rel="noreferrer">{entry.sourceUrl}</a></div> : null}
                    <div className="project-controls">
                      <button className="btn secondary" type="button" onClick={() => startKnowledgeEdit(entry)}>Edit</button>
                      <button className="btn danger" type="button" onClick={() => removeItem(`/api/knowledge/${entry._id}`, "Q&A entry deleted.", "Delete this chatbot Q&A?")}><Trash2 size={16} /> Delete</button>
                    </div>
                  </article>
                )) : <p className="status-text">No chatbot Q&A entries yet. Add answers for customer questions, social profiles, services, or CV details.</p>}
              </div>
            </>
          )}

          {activeSection === "messages" && (
            <>
              <h2>Inbox</h2>
              <div className="admin-projects">
                {messages.map((message) => (
                  <article className="message-card" key={message._id}>
                    <p className="eyebrow">{message.status} | {new Date(message.createdAt).toLocaleString()}</p>
                    <h3>{message.subject}</h3>
                    <p>{message.message}</p>
                    <div className="message-meta">
                      <a href={`mailto:${message.email}`}>{message.name} | {message.email}</a>
                      {message.phone ? <a href={`tel:${message.phone}`}>{message.phone}</a> : null}
                    </div>
                    <div className="project-controls">
                      <button className="btn secondary" type="button" onClick={() => updateMessage(message._id, "read")}>Mark Read</button>
                      <button className="btn secondary" type="button" onClick={() => updateMessage(message._id, "archived")}>Archive</button>
                      <button className="btn danger" type="button" onClick={() => removeItem(`/api/messages/${message._id}`, "Message deleted.", "Delete this message?")}><Trash2 size={16} /> Delete</button>
                    </div>
                  </article>
                ))}
              </div>
              <h2>Chat conversations</h2>
              <div className="admin-projects">
                {chatMessages.length ? chatMessages.map((chat) => (
                  <article className="message-card" key={chat._id}>
                    <p className="eyebrow">{chat.source} | {new Date(chat.createdAt).toLocaleString()}</p>
                    <h3>{chat.question}</h3>
                    <p>{chat.answer}</p>
                    <div className="message-meta">
                      <span>Session: {chat.sessionId}</span>
                    </div>
                  </article>
                )) : <p className="status-text">No chatbot conversations saved yet.</p>}
              </div>
            </>
          )}

          {activeSection === "content" && (
            <>
              <h2>Content Notes</h2>
              <div className="info-stack">
                <article className="info-card">
                  <h3>Direct contact</h3>
                  <p>Public users can email, call, download files, and submit stored contact requests.</p>
                </article>
                <article className="info-card">
                  <h3>SMTP notifications</h3>
                  <p>Fill `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `NOTIFY_EMAIL` in `.env` or Render to receive email alerts.</p>
                </article>
                <article className="info-card">
                  <h3>Live hosting</h3>
                  <p>Render and MongoDB Atlas can host this now. Actual publishing still needs your account access and environment variables.</p>
                </article>
              </div>
            </>
          )}

          {activeSection === "security" && (
            <>
              <h2>Security Notes</h2>
              <div className="info-stack">
                <article className="info-card">
                  <h3>Admin login</h3>
                  <p>JWT tokens expire after 8 hours. Change the admin password before sharing the live site.</p>
                </article>
                <article className="info-card">
                  <h3>Recommended next step</h3>
                  <p>When you are ready to deploy, rotate `ADMIN_PASSWORD` and `JWT_SECRET` in Render and keep them private.</p>
                </article>
              </div>
            </>
          )}
        </section>
      </section>
      <ChatWidget />
    </main>
  );
}
