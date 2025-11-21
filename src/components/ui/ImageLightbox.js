import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const ImageLightbox = ({ src, alt, onClose }) => {
  // Optional: Add keyboard support to close with the 'Escape' key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-fade-in"
      onClick={onClose} // Close when clicking on the background
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        onClick={onClose}
        aria-label="Close image viewer"
      >
        <X size={32} />
      </button>

      <div
        className="relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image container
      >
        <img
          src={src}
          alt={alt}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

// Add a simple fade-in animation in your global CSS file (e.g., src/index.css)
// @keyframes fadeIn {
//   from { opacity: 0; }
//   to { opacity: 1; }
// }
// .animate-fade-in {
//   animation: fadeIn 0.2s ease-out;
// }

export default ImageLightbox;