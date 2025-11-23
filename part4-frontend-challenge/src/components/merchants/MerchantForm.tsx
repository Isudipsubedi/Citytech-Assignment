import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Merchant, MerchantFormData } from '../../types/merchant';
import './MerchantForm.css';

interface MerchantFormProps {
  merchant?: Merchant | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MerchantFormData) => Promise<void>;
}

export const MerchantForm: React.FC<MerchantFormProps> = ({
  merchant,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<MerchantFormData>({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    registrationNumber: '',
    address: '',
    city: '',
    country: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MerchantFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing or reset when creating new
  useEffect(() => {
    if (merchant) {
      // Pre-populate form with existing merchant data
      setFormData({
        name: merchant.name || '',
        email: merchant.email || '',
        phone: merchant.phone || '',
        businessName: merchant.businessName || '',
        registrationNumber: merchant.registrationNumber || '',
        address: merchant.address || '',
        city: merchant.city || '',
        country: merchant.country || '',
        status: merchant.status || 'active',
      });
    } else {
      // Reset form for new merchant (form reset after successful creation)
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        registrationNumber: '',
        address: '',
        city: '',
        country: '',
        status: 'active',
      });
    }
    setErrors({});
  }, [merchant, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MerchantFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Merchant name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      // More flexible email validation - allows various formats from MockAPI
      // Basic email pattern: something@something.something
      const emailPattern = /^[^\s@<>()\[\]{}]+@[^\s@<>()\[\]{}]+\.[^\s@<>()\[\]{}]+/i;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // More flexible phone validation - allows various formats including international formats
      // Allows digits, spaces, dashes, plus signs, parentheses, dots, and slashes
      const phoneRegex = /^[\d\s\-\+\(\)\.\/]+$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof MerchantFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Only auto-close for new merchants
      // For edits, the parent will handle closing after confirmation
      if (!merchant) {
        onClose();
      }
      // For edits, keep form open until confirmation dialog completes
    } catch (error) {
      console.error('Error submitting form:', error);
      // You can add error handling here (e.g., show toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="merchant-form-overlay" onClick={onClose}>
      <div className="merchant-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="merchant-form-header">
          <h2>{merchant ? 'Edit Merchant' : 'Add New Merchant'}</h2>
          <button className="merchant-form-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="merchant-form-content">
          <div className="merchant-form-row">
            <Input
              label="Merchant Name *"
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              error={errors.name}
              required
            />
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={errors.email}
              required
            />
          </div>

          <div className="merchant-form-row">
            <Input
              label="Phone *"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={errors.phone}
              required
            />
            <div className="input-wrapper">
              <label className="input-label">Status *</label>
              <select
                className="input"
                value={formData.status}
                onChange={handleChange('status')}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="merchant-form-row">
            <Input
              label="Business Name"
              type="text"
              value={formData.businessName}
              onChange={handleChange('businessName')}
            />
            <Input
              label="Registration Number"
              type="text"
              value={formData.registrationNumber}
              onChange={handleChange('registrationNumber')}
            />
          </div>

          <Input
            label="Address"
            type="text"
            value={formData.address}
            onChange={handleChange('address')}
          />

          <div className="merchant-form-row">
            <Input
              label="City"
              type="text"
              value={formData.city}
              onChange={handleChange('city')}
            />
            <Input
              label="Country"
              type="text"
              value={formData.country}
              onChange={handleChange('country')}
            />
          </div>

          <div className="merchant-form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : merchant ? 'Update Merchant' : 'Create Merchant'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

