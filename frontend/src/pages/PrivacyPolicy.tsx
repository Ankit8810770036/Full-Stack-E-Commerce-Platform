import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="legal-page-container">
      <div className="legal-page-header">
        <Link to="/" className="legal-back-link">
          <ArrowLeft size={16} />
          <span>Back to Store</span>
        </Link>
        <div className="legal-header-badge">
          <Shield size={14} />
          <span>Legal & Transparency</span>
        </div>
        <h1>Privacy Policy</h1>
        <p className="legal-last-updated">
          Last Updated: October 2026 | Compliant with the Information Technology Act, 2000 and Digital Personal Data Protection Act
        </p>
      </div>

      <div className="legal-content-card">
        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Cartify India (&ldquo;Cartify&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We are committed to protecting your personal data and respecting your privacy. This Privacy Policy outlines how we collect, process, store, and safeguard your personal information when you visit our website, register an account, or purchase goods through our platform.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          <p>We collect only the essential information necessary to provide you with secure and efficient e-commerce services:</p>
          <ul>
            <li><strong>Account Data:</strong> Username, email address, password hash, and assigned customer roles upon registration.</li>
            <li><strong>Delivery Information:</strong> Full name, shipping address, landmark, city, state, postal PIN code, and contact telephone number.</li>
            <li><strong>Order History:</strong> Product identifiers, item quantities, total pricing, discounts applied, return/exchange submissions, and delivery progress.</li>
            <li><strong>Payment Metadata:</strong> Transaction reference identifiers, payment method chosen (e.g. UPI, Net Banking, Credit/Debit Card, COD). We do not store raw card credentials or UPI PINs on our servers.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. How We Use Your Information</h2>
          <p>Your information is processed strictly for the following purposes:</p>
          <ul>
            <li>Processing, fulfilling, and tracking your customer orders.</li>
            <li>Facilitating doorstep product returns, exchanges, and verified refunds.</li>
            <li>Authenticating user sessions and safeguarding your account against unauthorized access via industry-standard JSON Web Tokens (JWT).</li>
            <li>Providing customer support and communicating transactional updates regarding your orders.</li>
            <li>Complying with applicable statutory legal and taxation requirements in India.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Data Storage and Security</h2>
          <p>
            We implement rigorous technical, operational, and physical safeguards to prevent data loss, unauthorized access, alteration, or disclosure. All client-server communication is encrypted using Transport Layer Security (TLS 1.3). User passwords are cryptographically hashed using salted BCrypt prior to database persistence.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Third-Party Disclosures</h2>
          <p>
            We do not sell, rent, or trade your personal information to third parties. We share data solely with trusted logistics partners and payment processors exclusively for order fulfillment and payment clearance under strict data protection agreements.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Cookies and Local Storage</h2>
          <p>
            Our website uses minimal local storage tokens strictly necessary for user session persistence and offline shopping cart synchronization. We do not use third-party tracking pixels or behavioral cross-site advertising cookies.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Grievance Redressal Officer</h2>
          <p>
            In accordance with the Information Technology Act, 2000 and rules made thereunder, as well as the Consumer Protection (E-Commerce) Rules, 2020, the contact details of the Grievance Officer are:
          </p>
          <div className="grievance-box">
            <p><strong>Grievance Officer:</strong> Legal & Compliance Desk</p>
            <p><strong>Entity:</strong> Cartify Online Retail Private Limited</p>
            <p><strong>Address:</strong> Level 4, Tech Park Boulevard, Outer Ring Road, Bengaluru, Karnataka - 560103, India</p>
            <p><strong>Email:</strong> grievance@cartify.in</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
