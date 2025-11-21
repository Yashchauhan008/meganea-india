import React from 'react';

const Label = ({ children, ...props }) => {
  return (
    <label className="form-label" {...props}> {/* Apply the global style */}
      {children}
    </label>
  );
};

export default Label;
