import React from 'react';

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`form-select ${className || ''}`} // Apply the global style
      {...props}
    >
      {children}
    </select>
  );
});

export default Select;
