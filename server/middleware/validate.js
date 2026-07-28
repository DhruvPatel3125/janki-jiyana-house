import Joi from 'joi';
import { parsePhoneNumberWithError } from 'libphonenumber-js';

// List of allowed genuine email providers for D2C customers
const allowedEmailDomains = [
  'gmail.com',
  'yahoo.com',
  'yahoo.co.in',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'protonmail.com',
  'rediffmail.com',
  'aol.com',
  'ymail.com',
  'live.com',
  'msn.com'
];

// Custom email validator to enforce genuine emails only
const emailValidator = (value, helpers) => {
  if (!value) return value;
  const domain = value.split('@')[1]?.toLowerCase();
  
  if (!domain || !allowedEmailDomains.includes(domain)) {
    return helpers.error('email.disposable');
  }
  return value;
};

// Custom phone validator extension using libphonenumber-js and TRAI regulations
const phoneValidator = (value, helpers) => {
  if (!value) return value;
  const digits = value.replace(/\D/g, '');

  // Must be 10 digits
  if (digits.length !== 10) {
    return helpers.error('phone.invalid');
  }

  // Must start with valid Indian mobile prefix (6, 7, 8, 9)
  if (!/^[6-9]/.test(digits)) {
    return helpers.error('phone.invalid');
  }

  // Reject repeated fake numbers (e.g. 9999999999, 8888888888, 7777777777, 0000000000)
  if (/^(\d)\1{9}$/.test(digits)) {
    return helpers.error('phone.fake');
  }

  // Reject sequential fake numbers (e.g. 1234567890, 9876543210)
  if (digits === '1234567890' || digits === '0123456789' || digits === '9876543210') {
    return helpers.error('phone.fake');
  }

  // libphonenumber-js parse & type validation
  try {
    const phoneNumber = parsePhoneNumberWithError(`+91${digits}`, 'IN');
    if (!phoneNumber || !phoneNumber.isValid()) {
      return helpers.error('phone.invalid');
    }
  } catch (err) {
    return helpers.error('phone.invalid');
  }

  return value;
};

// Registration Schema
export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Full Name is required',
    'string.min': 'Full Name must be at least 2 characters long',
  }),
  email: Joi.string().email().trim().required().custom(emailValidator).messages({
    'string.empty': 'Email address is required',
    'string.email': 'Please enter a valid email address',
    'email.disposable': 'Temporary or disposable email addresses are not allowed. Please use a genuine email.',
  }),
  phone: Joi.string().required().custom(phoneValidator).messages({
    'string.empty': 'Mobile number is required',
    'phone.invalid': 'Please enter a valid 10-digit Indian mobile number',
    'phone.fake': 'Dummy mobile numbers (e.g. 9999999999) are not allowed. Please enter a real mobile number.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
  }),
  address: Joi.object().optional(),
  city: Joi.string().allow('').optional(),
});

// Login Schema
export const loginSchema = Joi.object({
  emailOrPhone: Joi.string().trim().optional(),
  email: Joi.string().trim().optional(),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

// Send OTP Schema
export const sendOtpSchema = Joi.object({
  email: Joi.string().email().trim().required().custom(emailValidator).messages({
    'string.empty': 'Email address is required to receive OTP',
    'string.email': 'Please enter a valid email address',
    'email.disposable': 'Temporary emails cannot be used for OTP verification. Please use a genuine email.',
  }),
  phone: Joi.string().allow('').optional(),
});

// Verify OTP Schema
export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().trim().required().custom(emailValidator).messages({
    'string.empty': 'Email address is required',
    'email.disposable': 'Temporary emails are not allowed.',
  }),
  otp: Joi.string().length(6).required().messages({
    'string.empty': '6-digit OTP code is required',
    'string.length': 'OTP code must be exactly 6 digits',
  }),
  name: Joi.string().allow('').optional(),
});

// Product Schema (Create/Update)
export const productSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Product name is required'
  }),
  category: Joi.string().trim().required().messages({
    'string.empty': 'Category is required'
  }),
  price: Joi.number().min(0).required().messages({
    'number.base': 'Price must be a valid number',
    'number.min': 'Price cannot be negative',
    'any.required': 'Product price is required'
  }),
  mrp: Joi.number().min(0).optional().allow(null, ''),
  stock: Joi.number().integer().min(0).required().messages({
    'number.base': 'Stock must be a valid number',
    'number.min': 'Stock cannot be negative',
    'any.required': 'Stock quantity is required'
  }),
  images: Joi.array().items(Joi.string().trim().allow('')).required(),
  description: Joi.string().trim().required().messages({
    'string.empty': 'Description is required'
  }),
  features: Joi.array().items(Joi.string().trim().allow('')).optional(),
  isFeatured: Joi.boolean().optional(),
});

// Express Validation Middleware
export const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join('. ');
    return res.status(400).json({ message: errorMessages });
  }
  next();
};
