import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Briefcase, Code2, Database, Download, ExternalLink, FileText, Globe2, Laptop, Mail, MapPin, Newspaper, Phone, Server, ShieldCheck, Wrench } from "lucide-react";
import Header from "../components/Header.jsx";
import { apiRequest, assetUrl } from "../lib/api.js";

const fallbackProjects = [
  {
    _id: "fallback-1",
    title: "Inventory Management System",
    category: "Business System",
    description: "A stock and sales tracking system with content workflows, reporting, and responsive interface design.",
    imageUrl: "/starter/project1.png",
    technologies: ["PHP", "MySQL", "Bootstrap"],
    featured: true
  },
  {
    _id: "fallback-2",
    title: "Class Schedule System",
    category: "University Tool",
    description: "A scheduling platform for class timetables, rooms, and faculty allocation.",
    technologies: ["PHP", "MySQL", "JavaScript"],
    featured: true
  }
];

const skillGroups = [
  {
    title: "Frontend",
    icon: Code2,
    items: ["React", "JavaScript", "Responsive UI", "Bootstrap", "WordPress"]
  },
  {
    title: "Backend",
    icon: Server,
    items: ["Node.js", "Express", "PHP", "REST APIs", "Authentication"]
  },
  {
    title: "Data & Support",
    icon: Wrench,
    items: ["MongoDB", "MySQL", "Dashboards", "CCTV support", "Troubleshooting"]
  }
];

const serviceItems = [
  { title: "Web Development", description: "Modern responsive websites, landing pages, portfolios, and company sites.", icon: "Laptop" },
  { title: "Business Systems", description: "Inventory, schedules, dashboards, reporting, and practical content workflows.", icon: "Database" },
  { title: "Technical Support", description: "System support, troubleshooting, CCTV systems, and operational documentation.", icon: "ShieldCheck" }
];

const iconMap = {
  Briefcase,
  Code2,
  Database,
  Laptop,
  Server,
  ShieldCheck,
  Wrench
};

const fallbackAssets = [
  {
    _id: "fallback-cv",
    title: "Hirko Gemechu CV",
    description: "Download my CV in DOCX format.",
    category: "CV",
    fileUrl: "/starter/hirko-gemechu-cv.docx"
  },
  {
    _id: "fallback-certificates",
    title: "Certificates",
    description: "A merged PDF of certificates and supporting documents.",
    category: "Certificates",
    fileUrl: "/starter/hirko-certificates.pdf"
  }
];

const heroStats = [
  { value: "Hirko", label: "Personal project studio" },
  { value: "MERN", label: "Mongo, Express, React, Node" },
  { value: "Upload", label: "Project images supported" }
];

const defaultSite = {
  headerTitle: "Hirko Gemechu",
  headerSubtitle: "MERN Developer | Software Engineer",
  heroTitle: "Building clean websites, dashboards, and business systems.",
  heroBody: "I build practical full-stack products that look professional and are easy to manage.",
  announcementText: "Available for freelance projects, internships, and full-time software roles.",
  primaryButtonLabel: "View Projects",
  primaryButtonUrl: "#projects",
  secondaryButtonLabel: "Contact Me",
  secondaryButtonUrl: "#contact",
  availabilityText: "Open to work",
  heroImageUrl: "/starter/hirko-optimized.jpg",
  heroStats,
  logoUrl: "/starter/logo.png",
  aboutTitle: "Full-stack development with practical support experience.",
  aboutBody: "I build responsive websites, business systems, dashboards, and technical support solutions.",
  aboutNote: "Hirko Gemechu can keep projects, images, files, blog posts, and website details fresh from one dashboard.",
  highlightTitle: "Why work with me",
  highlightBody: "I combine full-stack development, database design, and practical technical support experience to build useful systems for real workflows.",
  highlightItems: ["Clean responsive UI", "Hirko Gemechu portfolio", "Practical business systems"],
  servicesTitle: "What I can build",
  services: serviceItems,
  skillsTitle: "Practical stack for websites, systems, and support.",
  skillGroups,
  experienceTitle: "MERN portfolio CMS for Hirko Gemechu",
  experienceBody: "This site includes project management, image uploads, blog posts, public downloads, testimonials, contact messages, and secure dashboard access.",
  publicDownloads: fallbackAssets,
  testimonialsTitle: "Testimonials and certificates",
  projectsTitle: "Hirko Gemechu project showcase",
  downloadsTitle: "Files shared by Hirko Gemechu",
  blogTitle: "Latest updates",
  contactTitle: "Let us talk about your next project.",
  contactBody: "Send me a message for websites, dashboards, business systems, technical support, or job opportunities.",
  footerText: "2026 Hirko Gemechu. All rights reserved.",
  email: "hirkogemechu10@gmail.com",
  phone: "+251973100900",
  location: "Ethiopia",
  links: []
};

export default function App() {
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [posts, setPosts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [content, setContent] = useState(null);
  const [messageForm, setMessageForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [messageStatus, setMessageStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest("/api/projects").catch(() => fallbackProjects),
      apiRequest("/api/assets").catch(() => []),
      apiRequest("/api/content").catch(() => null),
      apiRequest("/api/posts").catch(() => []),
      apiRequest("/api/testimonials").catch(() => [])
    ])
      .then(([projectData, assetData, contentData, postData, testimonialData]) => {
        setProjects(projectData);
        setAssets(assetData);
        setContent(contentData);
        setPosts(postData);
        setTestimonials(testimonialData);
      })
      .finally(() => setLoading(false));
  }, []);

  const site = { ...defaultSite, ...(content || {}) };
  const visibleProjects = projects.length ? projects : fallbackProjects;
  const contentDownloads = site.publicDownloads?.length ? site.publicDownloads : fallbackAssets;
  const publicAssets = [
    ...contentDownloads,
    ...assets.filter((asset) => !contentDownloads.some((download) => download.fileUrl === asset.fileUrl))
  ];

  async function sendMessage(event) {
    event.preventDefault();
    setMessageStatus("Sending...");

    try {
      await apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify(messageForm)
      });
      setMessageStatus("Thank you. Your message was sent to Hirko Gemechu.");
      setMessageForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      setMessageStatus(error.message);
    }
  }

  return (
    <>
      <Header logoUrl={assetUrl(site.logoUrl)} />
      <main>
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div className="hero-copy">
              {site.announcementText ? <div className="announcement-bar">{site.announcementText}</div> : null}
              <p className="eyebrow">{site.headerSubtitle}</p>
              <h1>{site.heroTitle}</h1>
              <p className="hero-text">{site.heroBody}</p>
              <div className="hero-actions">
                <a className="btn primary" href={site.primaryButtonUrl || "#projects"}><Briefcase size={18} /> {site.primaryButtonLabel || "View Projects"}</a>
                <a className="btn secondary" href={site.secondaryButtonUrl || "#contact"}><Mail size={18} /> {site.secondaryButtonLabel || "Contact Me"}</a>
              </div>
              <div className="hero-stats">
                {(site.heroStats?.length ? site.heroStats : heroStats).slice(0, 3).map((stat) => (
                  <div key={`${stat.value}-${stat.label}`}><strong>{stat.value}</strong><span>{stat.label}</span></div>
                ))}
              </div>
            </div>
            <div className="hero-card">
              <img src={assetUrl(site.heroImageUrl)} alt="Hirko Gemechu" />
                <div className="availability"><span></span> {site.availabilityText || site.headerTitle}</div>
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container split">
            <div>
              <p className="eyebrow">About</p>
              <h2>{site.aboutTitle}</h2>
            </div>
            <div className="section-copy">
              <p>{site.aboutBody}</p>
              <p>{site.aboutNote}</p>
            </div>
          </div>
          {(site.highlightTitle || site.highlightBody || site.highlightItems?.length) ? (
            <div className="container highlight-panel">
              <div>
                <p className="eyebrow">Highlight</p>
                <h3>{site.highlightTitle}</h3>
                <p>{site.highlightBody}</p>
              </div>
              <div className="highlight-list">
                {(site.highlightItems || []).filter(Boolean).map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>
          ) : null}
        </section>

        <section className="section muted">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Services</p>
              <h2>{site.servicesTitle}</h2>
            </div>
            <div className="cards three">
              {(site.services?.length ? site.services : serviceItems).map((service) => {
                const Icon = iconMap[service.icon] || Laptop;
                return (
                  <article className="card" key={service.title}>
                    <Icon />
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section" id="skills">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Skills & Experience</p>
              <h2>{site.skillsTitle}</h2>
            </div>
            <div className="skills-layout">
              <div className="skills-grid">
                {(site.skillGroups?.length ? site.skillGroups : skillGroups).map((group) => {
                  const Icon = iconMap[group.icon] || Code2;
                  return (
                    <article className="skill-card" key={group.title}>
                      <div className="skill-icon"><Icon size={24} /></div>
                      <h3>{group.title}</h3>
                      <div className="tag-row">
                        {group.items?.map((item) => <span className="tag" key={item}>{item}</span>)}
                      </div>
                    </article>
                  );
                })}
              </div>
              <aside className="experience-card">
                <p className="eyebrow">Current Focus</p>
                <h3>{site.experienceTitle}</h3>
                <p>{site.experienceBody}</p>
                <a className="text-link" href="#downloads">View CV and certificates <Download size={16} /></a>
              </aside>
            </div>
          </div>
        </section>

        <section className="section" id="testimonials">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Trust & Certificates</p>
              <h2>{site.testimonialsTitle}</h2>
            </div>
            <div className="cards testimonials-grid">
              {testimonials.length ? testimonials.map((item) => (
                <article className="testimonial-card" key={item._id}>
                  {item.imageUrl ? <img src={assetUrl(item.imageUrl)} alt={item.name} /> : <Award size={34} />}
                  <div>
                    <p className="eyebrow">{item.type}</p>
                    <h3>{item.name}</h3>
                    <span>{item.role}</span>
                    <p>{item.quote}</p>
                    {item.fileUrl ? <a className="text-link" href={assetUrl(item.fileUrl)} target="_blank" rel="noreferrer">View certificate <ExternalLink size={16} /></a> : null}
                  </div>
                </article>
              )) : <p className="status-text">Testimonials and certificates will appear here after Hirko adds them.</p>}
            </div>
          </div>
        </section>

        <section className="section" id="projects">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Projects</p>
              <h2>{site.projectsTitle}</h2>
            </div>
            {loading ? <p className="status-text">Loading projects...</p> : null}
            <div className="cards projects-preview">
              {visibleProjects.map((project) => (
                <article className="project-card" key={project._id}>
                  {project.imageUrl ? (
                    <img src={assetUrl(project.imageUrl)} alt={project.title} />
                  ) : (
                    <div className="project-icon"><Globe2 size={46} /></div>
                  )}
                  <div>
                    <p className="eyebrow">{project.category}</p>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="tag-row">
                      {project.technologies?.map((tech) => <span className="tag" key={tech}>{tech}</span>)}
                    </div>
                    {project.liveUrl ? (
                      <a className="text-link" href={project.liveUrl} target="_blank" rel="noreferrer">
                        Visit project <ExternalLink size={16} />
                      </a>
                    ) : null}
                    {project.repoUrl ? (
                      <a className="text-link" href={project.repoUrl} target="_blank" rel="noreferrer">
                        View code <ExternalLink size={16} />
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section muted" id="downloads">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Downloads</p>
              <h2>{site.downloadsTitle}</h2>
            </div>
            <div className="cards downloads-grid">
              {publicAssets.length ? publicAssets.map((asset) => (
                <article className="download-card" key={asset._id || `${asset.category}-${asset.title}`}>
                  <FileText size={30} />
                  <div>
                    <p className="eyebrow">{asset.category}</p>
                    <h3>{asset.title}</h3>
                    <p>{asset.description || asset.fileName}</p>
                    <a className="btn secondary" href={assetUrl(asset.fileUrl)} download>
                      <Download size={17} /> Download
                    </a>
                  </div>
                </article>
              )) : <p className="status-text">No public files yet. Hirko can share CVs, PDFs, DOCX, images, and documents.</p>}
            </div>
          </div>
        </section>

        <section className="section" id="blog">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Blog & News</p>
              <h2>{site.blogTitle}</h2>
            </div>
            <div className="cards blog-grid">
              {posts.length ? posts.map((post) => (
                <article className="blog-card" key={post._id}>
                  {post.imageUrl ? <img src={assetUrl(post.imageUrl)} alt={post.title} /> : <div className="project-icon"><Newspaper size={42} /></div>}
                  <div>
                    <p className="eyebrow">{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</p>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="tag-row">{post.tags?.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
                  </div>
                </article>
              )) : <p className="status-text">No published news yet.</p>}
            </div>
          </div>
        </section>

        <section className="section cta" id="contact">
          <div className="container contact-grid-public">
            <div>
              <p className="eyebrow">Contact</p>
              <h2>{site.contactTitle}</h2>
              <p>{site.contactBody}</p>
              <div className="contact-actions">
                <a className="btn light" href={`mailto:${site.email}`}><Mail size={18} /> Email Me</a>
                <a className="btn ghost" href={`tel:${site.phone}`}><Phone size={18} /> Call</a>
                <span><MapPin size={17} /> {site.location}</span>
              </div>
            </div>
            <form className="public-contact-form" onSubmit={sendMessage}>
              <input value={messageForm.name} onChange={(event) => setMessageForm({ ...messageForm, name: event.target.value })} placeholder="Your name" required />
              <input type="email" value={messageForm.email} onChange={(event) => setMessageForm({ ...messageForm, email: event.target.value })} placeholder="Your email" required />
              <input value={messageForm.phone} onChange={(event) => setMessageForm({ ...messageForm, phone: event.target.value })} placeholder="Phone number" />
              <input value={messageForm.subject} onChange={(event) => setMessageForm({ ...messageForm, subject: event.target.value })} placeholder="Subject" required />
              <textarea rows="5" value={messageForm.message} onChange={(event) => setMessageForm({ ...messageForm, message: event.target.value })} placeholder="Message" required />
              <button className="btn light" type="submit"><Mail size={17} /> Send Request</button>
              {messageStatus ? <p>{messageStatus}</p> : null}
            </form>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container footer-content">
          <p>&copy; {site.footerText}</p>
          <div className="footer-links">
            {site.links?.map((link) => link.url ? <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">{link.label}</a> : null)}
          </div>
          <Link to="/admin/login">Hirko Login</Link>
        </div>
      </footer>
    </>
  );
}
