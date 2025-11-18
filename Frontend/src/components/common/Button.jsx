const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = ''
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-300 disabled:opacity-60 disabled:cursor-not-allowed',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg',
    outline: 'border-2 border-purple-300 text-purple-600 hover:bg-purple-50 focus:ring-purple-200 disabled:opacity-60 disabled:cursor-not-allowed',
    ghost: 'text-purple-600 hover:bg-purple-50 focus:ring-purple-200 disabled:opacity-60 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;