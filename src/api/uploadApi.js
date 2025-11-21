import api from './api';

/**
 * Uploads a single image file.
 * This function is reusable for any image upload in the app.
 * @param {FormData} formData - The FormData object containing the image file under the key 'image'.
 * @returns {Promise<object>} The server response with imageUrl and publicId.
 */
export const uploadImage = (formData) => {
  return api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
