export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = ''
}) {
  const baseClasses = 'font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';
  
  const variants = {
    primary: 'bg-neon-500 text-dark-500 hover:bg-neon-400 hover:shadow-lg hover:shadow-neon-500/50 focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 dark:focus:ring-offset-dark-500 animate-glow',
    secondary: 'bg-gray-800 text-neon-500 border-2 border-neon-500 hover:bg-neon-500 hover:text-dark-500 hover:shadow-lg hover:shadow-neon-500/30 focus:ring-2 focus:ring-neon-500 dark:bg-dark-300 dark:hover:bg-neon-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-dark-500',
    outline: 'border-2 border-neon-500 text-neon-500 hover:bg-neon-500 hover:text-dark-500 hover:shadow-lg hover:shadow-neon-500/30 focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 dark:focus:ring-offset-dark-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
}
