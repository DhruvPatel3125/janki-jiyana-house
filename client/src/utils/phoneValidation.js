import { parsePhoneNumberWithError } from 'libphonenumber-js';

/**
 * Strict validation for Indian Mobile Numbers using libphonenumber-js & TRAI regulations.
 * Rejects dummy/fake numbers like 9999999999, 8888888888, 1234567890, etc.
 * @param {string} phoneStr - Mobile number input
 * @returns {boolean} true if valid real Indian mobile number
 */
export const validateIndianMobile = (phoneStr) => {
  if (!phoneStr) return false;
  const digits = phoneStr.replace(/\D/g, '');

  // 1. Must be exactly 10 digits
  if (digits.length !== 10) return false;

  // 2. Must start with valid Indian mobile operator prefix (6, 7, 8, 9)
  if (!/^[6-9]/.test(digits)) return false;

  // 3. Reject dummy repeated numbers (e.g. 9999999999, 8888888888, 7777777777, 6666666666, 0000000000)
  if (/^(\d)\1{9}$/.test(digits)) return false;

  // 4. Reject trivial sequential numbers (e.g. 1234567890, 0123456789, 9876543210)
  if (digits === '1234567890' || digits === '0123456789' || digits === '9876543210') {
    return false;
  }

  // 5. libphonenumber-js strict parsing & type checking
  try {
    const phoneNumber = parsePhoneNumberWithError(`+91${digits}`, 'IN');
    if (!phoneNumber || !phoneNumber.isValid()) return false;

    const type = phoneNumber.getType();
    if (type && type !== 'MOBILE' && type !== 'FIXED_LINE_OR_MOBILE') {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};
