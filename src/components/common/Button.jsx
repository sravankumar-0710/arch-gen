// filepath: src/components/common/Button.jsx
// Purpose: Base button component with variant and size support. Used throughout the app.

const VARIANTS = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white border border-brand-400',
  secondary: 'bg-surface-raised hover:bg-surface-overlay text-slate-200 border border-surface-border',
  danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-500',
  ghost: 'bg-transparent hover:bg-surface-overlay text-slate-300 border border-transparent',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1 focus:ring-offset-surface-DEFAULT disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
