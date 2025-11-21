import React from 'react';

// This component is now much cleaner. It just applies the global .form-input class.
const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`form-input ${className || ''}`} // Apply the global style
      {...props}
    />
  );
});

export default Input;
