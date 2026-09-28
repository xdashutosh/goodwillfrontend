'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import styles from './contact.module.css';

export default function ContactForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  // Product label passed by the product page ("Serbia — A5 Daily (GP-34)")
  const productName = productId ? (searchParams.get('name') || '').slice(0, 150) : '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: productName ? `Enquiry: ${productName}` : '',
    message: productName
      ? `I would like pricing and customisation options for "${productName}".`
      : productId ? 'I would like to enquire about a product I viewed on your website.' : '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch(`${API_BASE}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          product_id: productId ? parseInt(productId, 10) : null,
        }),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Thank you! Your enquiry has been submitted. We will get back to you shortly.' });
        setFormData({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus({ type: 'error', message: data.error || 'Something went wrong. Please try again.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to submit enquiry. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.infoTitle}>Send Us a Message</h2>
      <form onSubmit={handleSubmit}>
        {productId && (
          <div className={styles.productNote}>
            {productName ? <>Enquiring about: <strong>{productName}</strong></> : 'This enquiry references a specific product you viewed.'}
          </div>
        )}

        {status.message && (
          <div
            role={status.type === 'success' ? 'status' : 'alert'}
            className={`${styles.status} ${status.type === 'success' ? styles.statusSuccess : styles.statusError}`}
          >
            {status.message}
          </div>
        )}

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="name">Full Name <span className={styles.required}>*</span></label>
            <input type="text" id="name" name="name" required placeholder="Your name" value={formData.name} onChange={handleChange} />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Email Address <span className={styles.required}>*</span></label>
            <input type="email" id="email" name="email" required placeholder="you@example.com" value={formData.email} onChange={handleChange} />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="phone">Phone Number <span className={styles.required}>*</span></label>
            <input type="tel" id="phone" name="phone" required placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} />
          </div>
          <div className={styles.field}>
            <label htmlFor="company">Company / Organization</label>
            <input type="text" id="company" name="company" placeholder="Optional" value={formData.company} onChange={handleChange} />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="subject">Subject <span className={styles.required}>*</span></label>
          <input type="text" id="subject" name="subject" required placeholder="What is your enquiry about?" value={formData.subject} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label htmlFor="message">Message <span className={styles.required}>*</span></label>
          <textarea id="message" name="message" rows="3" required placeholder="Tell us about your requirement, quantities, timelines, etc." value={formData.message} onChange={handleChange}></textarea>
        </div>

        <button type="submit" className={`btn-primary ${styles.submit}`} disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Enquiry'}
        </button>
      </form>
    </div>
  );
}
