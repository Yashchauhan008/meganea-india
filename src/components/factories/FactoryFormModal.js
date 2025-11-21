import React, { useState, useEffect } from 'react';
import { createFactory, updateFactory } from '../../api/factoryApi';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { X } from 'lucide-react';

const FactoryFormModal = ({ factory, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', address: '', contactPerson: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditMode = !!factory;

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: factory.name || '',
        address: factory.address || '',
        contactPerson: factory.contactPerson || '',
      });
    } else {
      setFormData({ name: '', address: '', contactPerson: '' });
    }
  }, [factory, isEditMode]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEditMode) {
        await updateFactory(factory._id, formData);
      } else {
        await createFactory(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to save factory.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {/* The modal now uses theme colors for its background and text */}
      <div className="bg-foreground dark:bg-dark-foreground rounded-lg shadow-xl p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text">
          <X size={24} />
        </button>
        <h1 className="text-3xl font-bold text-text dark:text-dark-text mb-6">
          {isEditMode ? 'Edit Factory' : 'Add New Factory'}
        </h1>
        {error && <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
        
        {/* The form is now clean. The components handle their own styling globally. */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Factory Name <span className="text-red-500">*</span></Label>
            <Input id="name" name="name" required value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full mt-4 px-4 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Factory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FactoryFormModal;
