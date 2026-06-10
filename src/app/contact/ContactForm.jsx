'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_BASE } from '@/lib/api';

export default function ContactForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: productId ? 'I would like to enquire about a product I viewed on your website.' : '',
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
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
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
    <div className="glass-card" style={{ padding: '2.5rem' }}>
      <form onSubmit={handleSubmit}>
        {productId && (
          <div style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: '8px', backgroundColor: 'rgba(201, 168, 76, 0.1)', border: '1px solid var(--glass-border)', color: 'var(--gold-light)', fontSize: '0.9rem' }}>
            This enquiry references a specific product you viewed.
          </div>
        )}

        {status.message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${status.type === 'success' ? '#10b981' : '#ef4444'}`,
            color: status.type === 'success' ? '#10b981' : '#ef4444',
          }}>
            {status.message}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name">Full Name *</label>
          <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email Address *</label>
          <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="company">Company / Organization</label>
          <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="message">Message *</label>
          <textarea id="message" name="message" rows="5" required value={formData.message} onChange={handleChange}></textarea>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Enquiry'}
        </button>
      </form>
    </div>
  );
}
