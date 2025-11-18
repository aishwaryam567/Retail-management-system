const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-purple-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-purple-900 placeholder:text-purple-400 ${
          error 
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50' 
            : 'border-purple-200 hover:border-purple-300 focus:border-purple-500 focus:ring-purple-100 bg-white'
        } ${
          disabled 
            ? 'bg-purple-50 cursor-not-allowed text-purple-400' 
            : 'bg-white'
        } ${sizeStyles[size]}`}
      />
      {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
};

export default Input;