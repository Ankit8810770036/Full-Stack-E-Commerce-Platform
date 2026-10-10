import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsConditions: React.FC = () => {
  return (
    <div className="legal-page-container">
      <div className="legal-page-header">
        <Link to="/" className="legal-back-link">
          <ArrowLeft size={16} />
          <span>Back to Store</span>
        </Link>
        <div className="legal-header-badge">
          <FileText size={14} />
          <span>Legal Agreement</span>
        </div>
        <h1>Terms and Conditions</h1>
        <p className="legal-last-updated">
          Last Updated: October 2026 | Effective for all transactions across India
        </p>
      </div>

      <div className="legal-content-card">
        <section className="legal-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using the Cartify India platform (&ldquo;Website&rdquo; or &ldquo;Store&rdquo;), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue using our services immediately.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Eligibility and User Accounts</h2>
          <p>
            To register an account or execute a purchase on Cartify, you must be at least 18 years of age or possess legal capacity under the Indian Contract Act, 1872. You are responsible for maintaining the confidentiality of your username and password, and for all activities conducted under your account.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Product Pricing and Catalog Accuracy</h2>
          <p>
            All prices listed on the platform are in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST) unless explicitly indicated otherwise. While we strive for absolute accuracy in catalog descriptions and inventory levels:
          </p>
          <ul>
            <li>We reserve the right to correct typographical pricing or inventory errors prior to order dispatch.</li>
            <li>In the event of an erroneous price listing, we will contact you before shipment or cancel the order with a full immediate refund.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Order Placement and Stock Confirmation</h2>
          <p>
            An order confirmation receipt is generated upon successful payment authorization or COD verification. Delivery timelines range typically between 2 to 4 business days depending upon the destination PIN code. Real-time stock decrement is applied at checkout to ensure orders do not exceed physical inventory.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. 7-Day Doorstep Returns and Exchanges</h2>
          <p>
            Customers may request a product return or replacement within 7 calendar days of confirmed delivery for eligible categories. The returned item must be in its original condition, unworn, unused, with all brand tags and original packaging intact. Doorstep pickups are scheduled at no additional surcharge for defective, damaged, or mismatched items.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Refunds and Processing Timelines</h2>
          <p>
            Approved refunds are initiated within 24 to 48 hours following pickup inspection. UPI and Net Banking refunds are credited directly to the customer&rsquo;s source bank account within 2 to 5 business days as governed by the Reserve Bank of India (RBI) payment clearing guidelines.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Intellectual Property</h2>
          <p>
            All trademarks, logos, brand names, product photographs, and software code presented on this website are the property of Cartify Online Retail Private Limited or their respective brand copyright holders. Any unauthorized copying or commercial exploitation is strictly prohibited.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Governing Law and Jurisdiction</h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsConditions;
