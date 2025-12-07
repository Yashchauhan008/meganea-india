import React from 'react';
import Slider from 'rc-slider';

// This component is now fixed to correctly display the slider track and handle.
const ThemedSlider = ({ ...props }) => {
  return (
    <Slider
      {...props}
      // --- THIS IS THE FIX ---
      // We now use the `classNames` prop, which is the modern way to style rc-slider.
      // These classes directly use our theme variables defined in tailwind.config.js.
      classNames={{
        rail: 'bg-border dark:bg-dark-border',
        track: 'bg-primary dark:bg-dark-primary',
        handle: 'border-primary dark:border-dark-primary bg-primary dark:bg-dark-primary focus:shadow-none',
      }}
      // The old `styles` prop is removed as it's no longer needed.
    />
  );
};

export default ThemedSlider;
