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
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-gradient-to-r from-[#898AC4] to-[#A2AADB] hover:from-[#7879B3] hover:to-[#9199CA] text-white focus:ring-[#A2AADB] disabled:opacity-50 shadow-lg hover:shadow-xl',
    secondary: 'bg-[#C0C9EE] hover:bg-[#A2AADB] text-[#898AC4] focus:ring-[#A2AADB] disabled:opacity-50',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 disabled:bg-green-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-300',
    outline: 'border-2 border-[#898AC4] text-[#898AC4] hover:bg-[#FFF2E0] focus:ring-[#A2AADB] disabled:border-[#C0C9EE] disabled:text-[#C0C9EE]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className} disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
};

export default Button;