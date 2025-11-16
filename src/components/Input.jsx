export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  className = ''
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-bold text-gray-700 dark:text-neon-500 mb-2">
          {label}
          {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full px-4 py-2 border rounded-lg 
          bg-white dark:bg-dark-300 
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          focus:ring-2 focus:ring-neon-500 focus:border-transparent
          focus:shadow-lg focus:shadow-neon-500/20
          transition-all duration-300
          ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-neon-500/30'}
          ${disabled ? 'bg-gray-100 dark:bg-dark-200 cursor-not-allowed opacity-60' : ''}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
