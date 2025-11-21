import React, { useState, useEffect } from 'react';
import { createTile, updateTile, getUniqueSizes } from '../../api/tileApi'; // <-- Import getUniqueSizes
import { uploadImage } from '../../api/uploadApi';
import { getAllFactories } from '../../api/factoryApi';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Select from '../ui/Select';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';
import { X, UploadCloud } from 'lucide-react';

const TileFormModal = ({ tile, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '', number: '', size: '', surface: 'Glossy', imageUrl: '', publicId: '',
        conversionFactor: 1.44,
        manufacturingFactories: [],
    });
    
    // --- STATE FOR DYNAMIC SIZES ---
    const [uniqueSizes, setUniqueSizes] = useState([]);
    const [customSize, setCustomSize] = useState('');
    // ---------------------------------

    const [allFactories, setAllFactories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isEditMode = !!tile;

    // Fetch both factories and unique sizes on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [factoriesRes, sizesRes] = await Promise.all([
                    getAllFactories(),
                    getUniqueSizes()
                ]);
                setAllFactories(factoriesRes.data);
                setUniqueSizes(sizesRes.data);

                // If creating a new tile, default size to the first in the dynamic list
                if (!isEditMode && sizesRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, size: sizesRes.data[0] }));
                }

            } catch (err) {
                setError('Could not load required form data.');
            }
        };
        fetchData();
    }, [isEditMode]); // Rerun if mode changes, though it won't in practice

    // Effect to populate form in edit mode
    useEffect(() => {
        if (isEditMode && uniqueSizes.length > 0) {
            const isCustom = !uniqueSizes.includes(tile.size) && tile.size;
            setFormData({
                name: tile.name || '',
                number: tile.number || '',
                size: isCustom ? 'Custom' : tile.size || '',
                surface: tile.surface || 'Glossy',
                imageUrl: tile.imageUrl || '',
                publicId: tile.publicId || '',
                conversionFactor: tile.conversionFactor || 1.44,
                manufacturingFactories: tile.manufacturingFactories?.map(f => f._id || f) || [],
            });
            if (tile.imageUrl) setImagePreview(tile.imageUrl);
            if (isCustom) {
                setCustomSize(tile.size);
            }
        }
    }, [tile, isEditMode, uniqueSizes]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'size' && value !== 'Custom') {
            setCustomSize('');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleFactoryChange = (selectedFactoryIds) => {
        setFormData(prev => ({ ...prev, manufacturingFactories: selectedFactoryIds }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            let finalImageUrl = formData.imageUrl;
            let finalPublicId = formData.publicId;

            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', imageFile);
                const uploadResponse = await uploadImage(uploadFormData);
                finalImageUrl = uploadResponse.data.imageUrl;
                finalPublicId = uploadResponse.data.publicId;
            }

            const finalSize = formData.size === 'Custom' ? customSize : formData.size;
            if (!finalSize) {
                setError('Size is a required field.');
                setLoading(false);
                return;
            }
            
            const submissionData = {
                name: formData.name, number: formData.number, surface: formData.surface,
                imageUrl: finalImageUrl, publicId: finalPublicId,
                conversionFactor: Number(formData.conversionFactor),
                size: finalSize,
                manufacturingFactories: formData.manufacturingFactories,
            };

            if (isEditMode) {
                await updateTile(tile._id, submissionData);
            } else {
                await createTile(submissionData);
            }
            
            onSave();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save tile.');
        } finally {
            setLoading(false);
        }
    };

    const factoryOptions = allFactories.map(f => ({ value: f._id, label: f.name }));

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-foreground dark:bg-dark-foreground rounded-lg shadow-xl p-8 w-full max-w-4xl relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text"><X size={24} /></button>
                <h1 className="text-3xl font-bold text-text dark:text-dark-text mb-6">{isEditMode ? 'Edit Tile' : 'Add New Tile'}</h1>
                {error && <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
                
                <form id="tile-form" onSubmit={handleSubmit} className="flex-grow space-y-4 overflow-y-auto pr-2">
                    {/* ... (Image Upload and Name/Number inputs remain the same) ... */}
                    <div>
                        <Label>Tile Image</Label>
                        <div className="mt-2 flex items-center gap-6">
                            <div className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-border dark:border-dark-border rounded-md flex items-center justify-center">
                                {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" /> : <UploadCloud size={32} className="text-text-secondary dark:text-dark-text-secondary" />}
                            </div>
                            <label htmlFor="file-upload" className="cursor-pointer bg-primary text-white px-4 py-2 text-sm font-semibold rounded-md hover:bg-primary-hover">
                                <span>Upload Image</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="name">Tile Name <span className="text-red-500">*</span></Label><Input id="name" name="name" required value={formData.name} onChange={handleChange} /></div>
                        <div><Label htmlFor="number">Tile Number</Label><Input id="number" name="number" value={formData.number} onChange={handleChange} /></div>
                    </div>

                    <div>
                        <Label>Manufacturing Factories</Label>
                        <MultiSelectDropdown
                            options={factoryOptions}
                            selected={formData.manufacturingFactories}
                            onChange={handleFactoryChange}
                            placeholder="Select factories..."
                        />
                    </div>
                    
                    {/* --- DYNAMIC SIZE INPUT LOGIC --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="size">Size</Label>
                            <Select id="size" name="size" value={formData.size} onChange={handleChange} required>
                                <option value="" disabled>Select a size</option>
                                {uniqueSizes.map(s => <option key={s} value={s}>{s}</option>)}
                                <option value="Custom">Custom Size</option>
                            </Select>
                        </div>
                        
                        {formData.size === 'Custom' && (
                            <div>
                                <Label htmlFor="customSize">Enter Custom Size <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="customSize" 
                                    name="customSize" 
                                    value={customSize} 
                                    onChange={(e) => setCustomSize(e.target.value)} 
                                    placeholder="e.g., 75x150cm"
                                    required 
                                />
                            </div>
                        )}

                        <div>
                            <Label htmlFor="conversionFactor">Boxes per Sq.M.</Label>
                            <Input id="conversionFactor" name="conversionFactor" type="number" step="0.01" value={formData.conversionFactor} onChange={handleChange} />
                        </div>
                        
                        <div>
                            <Label htmlFor="surface">Surface</Label>
                            <Select id="surface" name="surface" value={formData.surface} onChange={handleChange}>
                                <option>Glossy</option>
                                <option>Matt</option>
                            </Select>
                        </div>
                    </div>
                    {/* --- END OF DYNAMIC LOGIC --- */}
                </form>

                <div className="mt-6 pt-4 border-t border-border dark:border-dark-border">
                    <button type="submit" form="tile-form" disabled={loading} className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Tile'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TileFormModal;
