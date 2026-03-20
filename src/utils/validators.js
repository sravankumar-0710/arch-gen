// filepath: src/utils/validators.js
// Purpose: Input validation helpers for forms — returns error strings or null.

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required.'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address.'
  return null
}

export function validatePassword(password) {
  if (!password) return 'Password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  return null
}

export function validateName(name) {
  if (!name || !name.trim()) return 'Name is required.'
  if (name.trim().length < 2) return 'Name must be at least 2 characters.'
  return null
}

export function validateProjectName(name) {
  if (!name || !name.trim()) return 'Project name is required.'
  if (name.trim().length > 100) return 'Project name must be 100 characters or fewer.'
  return null
}

export function validateDimension(value, label) {
  const num = parseFloat(value)
  if (isNaN(num) || num <= 0) return `${label} must be a positive number.`
  if (num > 10000) return `${label} seems unrealistically large. Please check the value.`
  return null
}
