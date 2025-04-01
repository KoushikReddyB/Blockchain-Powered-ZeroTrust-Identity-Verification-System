import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import About from "./pages/About";
import "./App.css";

const HeroSection = () => {
  const [animateTitle, setAnimateTitle] = useState(false);
  
  useEffect(() => {
    setAnimateTitle(true);
  }, []);

  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1 className={`hero-title ${animateTitle ? 'animate-in' : ''}`}>
          <span className="title-part">Zero</span>
          <span className="title-part trust">Trust</span>
          <span className="title-part">Blockchain</span>
        </h1>
        <p className="hero-subtitle">Secure. Decentralized. Revolutionary.</p>
        <div className="hero-description">
          <p>Experience the next generation of security infrastructure with our Zero Trust blockchain solution. 
             Eliminate traditional security vulnerabilities while maintaining seamless access control.</p>
        </div>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary">Get Started</Link>
          <Link to="/about" className="btn btn-secondary">Learn More</Link>
        </div>
      </div>
      <div className="hero-visual">
        <div className="blockchain-animation">
          <div className="block block-1"></div>
          <div className="block block-2"></div>
          <div className="block block-3"></div>
          <div className="chain chain-1"></div>
          <div className="chain chain-2"></div>
        </div>
      </div>
    </div>
  );
};

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon"></div>
          <span>ZeroTrust</span>
        </Link>
        
        <div className={`menu-toggle ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <ul className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
          <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
          <li><Link to="/register" onClick={() => setMenuOpen(false)} className="nav-btn-primary">Register</Link></li>
        </ul>
      </div>
    </nav>
  );
};


const App = () => {
  return (
    <Router>
      <div className="app-container">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HeroSection />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;