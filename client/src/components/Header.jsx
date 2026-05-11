import { Link } from "react-router-dom";
import { Menu, UserRound, X } from "lucide-react";
import { useState } from "react";

export default function Header({ logoUrl = "/starter/logo.png" }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <nav className="nav container">
        <a className="brand" href="#home" onClick={() => setOpen(false)}>
          <img src={logoUrl} alt="HirkoDev logo" />
          <span>HirkoDev</span>
        </a>
        <button
          className="nav-toggle"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-controls="site-navigation"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className={`nav-links ${open ? "show" : ""}`} id="site-navigation">
          <a href="#home" onClick={() => setOpen(false)}>Home</a>
          <a href="#about" onClick={() => setOpen(false)}>About</a>
          <a href="#skills" onClick={() => setOpen(false)}>Skills</a>
          <a href="#projects" onClick={() => setOpen(false)}>Projects</a>
          <a href="#downloads" onClick={() => setOpen(false)}>Downloads</a>
          <a href="#blog" onClick={() => setOpen(false)}>Blog</a>
          <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
          <Link className="admin-link" to="/admin/login" onClick={() => setOpen(false)}>
            <UserRound size={17} /> Hirko
          </Link>
        </div>
      </nav>
    </header>
  );
}
