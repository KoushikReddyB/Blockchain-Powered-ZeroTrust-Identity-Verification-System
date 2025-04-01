import React from "react";

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About ZeroTrust Blockchain</h1>
        <div className="accent-line"></div>
      </div>
      
      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          At ZeroTrust Blockchain, we're redefining security paradigms by combining the 
          Zero Trust security model with blockchain technology. Our mission is to create 
          an infrastructure where security is built-in by design, not added as an afterthought.
        </p>
      </section>
      
      <section className="about-section">
        <h2>What is Zero Trust?</h2>
        <p>
          Zero Trust is a security concept based on the principle of "never trust, always verify." 
          It requires all users, whether inside or outside the organization's network, to be 
          authenticated, authorized, and continuously validated before being granted access to 
          applications and data.
        </p>
      </section>
      
      <section className="about-section features-grid">
        <div className="feature-card">
          <div className="feature-icon secure"></div>
          <h3>Enhanced Security</h3>
          <p>Multi-layered authentication and authorization mechanisms ensure only legitimate users gain access.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon decentralized"></div>
          <h3>Decentralized Architecture</h3>
          <p>No single point of failure means greater resilience against attacks and outages.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon transparent"></div>
          <h3>Transparent Auditing</h3>
          <p>All access attempts and transactions are immutably recorded on the blockchain.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon scalable"></div>
          <h3>Scalable Solutions</h3>
          <p>Our infrastructure grows with your needs without compromising on security or performance.</p>
        </div>
      </section>
      
      <section className="about-section">
        <h2>Our Technology</h2>
        <p>
          Our platform leverages advanced cryptographic techniques, distributed ledger technology, 
          and smart contracts to create a seamless yet highly secure environment. By tokenizing 
          access rights and recording authentication events on an immutable blockchain, we eliminate 
          traditional vulnerabilities while maintaining complete auditability.
        </p>
      </section>
    </div>
  );
};

export default About;