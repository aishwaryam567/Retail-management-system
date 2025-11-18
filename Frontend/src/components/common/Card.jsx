const Card = ({ title, children, className = '', headerAction, variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md hover:shadow-lg transition-all',
    flat: 'bg-gray-50 border border-gray-100',
  };

  return (
    <div className={`rounded-xl overflow-hidden ${variantStyles[variant]} ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;