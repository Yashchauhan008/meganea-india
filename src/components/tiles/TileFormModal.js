// import React, { useState, useEffect } from 'react';
// import { createTile, updateTile, getUniqueSizes } from '../../api/tileApi'; // <-- Import getUniqueSizes
// import { uploadImage } from '../../api/uploadApi';
// import { getAllFactories } from '../../api/factoryApi';
// import Input from '../ui/Input';
// import Label from '../ui/Label';
// import Select from '../ui/Select';
// import MultiSelectDropdown from '../ui/MultiSelectDropdown';
// import { X, UploadCloud } from 'lucide-react';

// const TileFormModal = ({ tile, onClose, onSave }) => {
//     const [formData, setFormData] = useState({
//         name: '', number: '', size: '', surface: 'Glossy', imageUrl: '', publicId: '',
//         conversionFactor: 1.44,
//         manufacturingFactories: [],
//     });
    
//     // --- STATE FOR DYNAMIC SIZES ---
//     const [uniqueSizes, setUniqueSizes] = useState([]);
//     const [customSize, setCustomSize] = useState('');
//     // ---------------------------------

//     const [allFactories, setAllFactories] = useState([]);
//     const [imageFile, setImageFile] = useState(null);
//     const [imagePreview, setImagePreview] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const isEditMode = !!tile;

//     // Fetch both factories and unique sizes on component mount
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const [factoriesRes, sizesRes] = await Promise.all([
//                     getAllFactories(),
//                     getUniqueSizes()
//                 ]);
//                 setAllFactories(factoriesRes.data);
//                 setUniqueSizes(sizesRes.data);

//                 // If creating a new tile, default size to the first in the dynamic list
//                 if (!isEditMode && sizesRes.data.length > 0) {
//                     setFormData(prev => ({ ...prev, size: sizesRes.data[0] }));
//                 }

//             } catch (err) {
//                 setError('Could not load required form data.');
//             }
//         };
//         fetchData();
//     }, [isEditMode]); // Rerun if mode changes, though it won't in practice

//     // Effect to populate form in edit mode
//     useEffect(() => {
//         if (isEditMode && uniqueSizes.length > 0) {
//             const isCustom = !uniqueSizes.includes(tile.size) && tile.size;
//             setFormData({
//                 name: tile.name || '',
//                 number: tile.number || '',
//                 size: isCustom ? 'Custom' : tile.size || '',
//                 surface: tile.surface || 'Glossy',
//                 imageUrl: tile.imageUrl || '',
//                 publicId: tile.publicId || '',
//                 conversionFactor: tile.conversionFactor || 1.44,
//                 manufacturingFactories: tile.manufacturingFactories?.map(f => f._id || f) || [],
//             });
//             if (tile.imageUrl) setImagePreview(tile.imageUrl);
//             if (isCustom) {
//                 setCustomSize(tile.size);
//             }
//         }
//     }, [tile, isEditMode, uniqueSizes]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//         if (name === 'size' && value !== 'Custom') {
//             setCustomSize('');
//         }
//     };

//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setImageFile(file);
//             setImagePreview(URL.createObjectURL(file));
//         }
//     };

//     const handleFactoryChange = (selectedFactoryIds) => {
//         setFormData(prev => ({ ...prev, manufacturingFactories: selectedFactoryIds }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
//         try {
//             let finalImageUrl = formData.imageUrl;
//             let finalPublicId = formData.publicId;

//             if (imageFile) {
//                 const uploadFormData = new FormData();
//                 uploadFormData.append('image', imageFile);
//                 const uploadResponse = await uploadImage(uploadFormData);
//                 finalImageUrl = uploadResponse.data.imageUrl;
//                 finalPublicId = uploadResponse.data.publicId;
//             }

//             const finalSize = formData.size === 'Custom' ? customSize : formData.size;
//             if (!finalSize) {
//                 setError('Size is a required field.');
//                 setLoading(false);
//                 return;
//             }
            
//             const submissionData = {
//                 name: formData.name, number: formData.number, surface: formData.surface,
//                 imageUrl: finalImageUrl, publicId: finalPublicId,
//                 conversionFactor: Number(formData.conversionFactor),
//                 size: finalSize,
//                 manufacturingFactories: formData.manufacturingFactories,
//             };

//             if (isEditMode) {
//                 await updateTile(tile._id, submissionData);
//             } else {
//                 await createTile(submissionData);
//             }
            
//             onSave();
//             onClose();
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to save tile.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const factoryOptions = allFactories.map(f => ({ value: f._id, label: f.name }));

//     return (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//             <div className="bg-foreground dark:bg-dark-foreground rounded-lg shadow-xl p-8 w-full max-w-4xl relative max-h-[90vh] flex flex-col">
//                 <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text"><X size={24} /></button>
//                 <h1 className="text-3xl font-bold text-text dark:text-dark-text mb-6">{isEditMode ? 'Edit Tile' : 'Add New Tile'}</h1>
//                 {error && <p className="text-red-500 mb-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
                
//                 <form id="tile-form" onSubmit={handleSubmit} className="flex-grow space-y-4 overflow-y-auto pr-2">
//                     {/* ... (Image Upload and Name/Number inputs remain the same) ... */}
//                     <div>
//                         <Label>Tile Image</Label>
//                         <div className="mt-2 flex items-center gap-6">
//                             <div className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-border dark:border-dark-border rounded-md flex items-center justify-center">
//                                 {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" /> : <UploadCloud size={32} className="text-text-secondary dark:text-dark-text-secondary" />}
//                             </div>
//                             <label htmlFor="file-upload" className="cursor-pointer bg-primary text-white px-4 py-2 text-sm font-semibold rounded-md hover:bg-primary-hover">
//                                 <span>Upload Image</span>
//                                 <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
//                             </label>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div><Label htmlFor="name">Tile Name <span className="text-red-500">*</span></Label><Input id="name" name="name" required value={formData.name} onChange={handleChange} /></div>
//                         <div><Label htmlFor="number">Tile Number</Label><Input id="number" name="number" value={formData.number} onChange={handleChange} /></div>
//                     </div>

//                     <div>
//                         <Label>Manufacturing Factories</Label>
//                         <MultiSelectDropdown
//                             options={factoryOptions}
//                             selected={formData.manufacturingFactories}
//                             onChange={handleFactoryChange}
//                             placeholder="Select factories..."
//                         />
//                     </div>
                    
//                     {/* --- DYNAMIC SIZE INPUT LOGIC --- */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                             <Label htmlFor="size">Size</Label>
//                             <Select id="size" name="size" value={formData.size} onChange={handleChange} required>
//                                 <option value="" disabled>Select a size</option>
//                                 {uniqueSizes.map(s => <option key={s} value={s}>{s}</option>)}
//                                 <option value="Custom">Custom Size</option>
//                             </Select>
//                         </div>
                        
//                         {formData.size === 'Custom' && (
//                             <div>
//                                 <Label htmlFor="customSize">Enter Custom Size <span className="text-red-500">*</span></Label>
//                                 <Input 
//                                     id="customSize" 
//                                     name="customSize" 
//                                     value={customSize} 
//                                     onChange={(e) => setCustomSize(e.target.value)} 
//                                     placeholder="e.g., 75x150cm"
//                                     required 
//                                 />
//                             </div>
//                         )}

//                         <div>
//                             <Label htmlFor="conversionFactor">Boxes per Sq.M.</Label>
//                             <Input id="conversionFactor" name="conversionFactor" type="number" step="0.01" value={formData.conversionFactor} onChange={handleChange} />
//                         </div>
                        
//                         <div>
//                             <Label htmlFor="surface">Surface</Label>
//                             <Select id="surface" name="surface" value={formData.surface} onChange={handleChange}>
//                                 <option>Glossy</option>
//                                 <option>Matt</option>
//                             </Select>
//                         </div>
//                     </div>
//                     {/* --- END OF DYNAMIC LOGIC --- */}
//                 </form>

//                 <div className="mt-6 pt-4 border-t border-border dark:border-dark-border">
//                     <button type="submit" form="tile-form" disabled={loading} className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover disabled:opacity-50">
//                         {loading ? 'Saving...' : 'Save Tile'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TileFormModal;

// FILE LOCATION: src/components/tiles/TileFormModal.js

import React, { useState, useEffect } from 'react';
import { createTile, updateTile, getUniqueSizes } from '../../api/tileApi';
import { uploadImage } from '../../api/uploadApi';
import { getAllFactories } from '../../api/factoryApi';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Select from '../ui/Select';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';
import { X, UploadCloud, Loader2, AlertCircle, Save, Image } from 'lucide-react';

const TileFormModal = ({ tile, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        size: '',
        surface: 'Glossy',
        imageUrl: '',
        publicId: '',
        conversionFactor: 1.44,
        restockThreshold: 0,
        manufacturingFactories: [],
    });
    
    const [uniqueSizes, setUniqueSizes] = useState([]);
    const [customSize, setCustomSize] = useState('');
    const [allFactories, setAllFactories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');
    const isEditMode = !!tile;

    // Fetch factories and unique sizes on mount
    useEffect(() => {
        const fetchData = async () => {
            setDataLoading(true);
            try {
                const [factoriesRes, sizesRes] = await Promise.all([
                    getAllFactories(),
                    getUniqueSizes()
                ]);
                
                const factoriesData = factoriesRes?.data || factoriesRes || [];
                const sizesData = sizesRes?.data || sizesRes || [];
                
                setAllFactories(Array.isArray(factoriesData) ? factoriesData : []);
                setUniqueSizes(Array.isArray(sizesData) ? sizesData : []);

                // Default size for new tiles
                if (!isEditMode && sizesData.length > 0) {
                    setFormData(prev => ({ ...prev, size: sizesData[0] }));
                }
            } catch (err) {
                console.error('Error fetching form data:', err);
                setError('Could not load required form data.');
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, [isEditMode]);

    // Populate form in edit mode
    useEffect(() => {
        if (isEditMode && tile && !dataLoading) {
            const isCustom = uniqueSizes.length > 0 && !uniqueSizes.includes(tile.size) && tile.size;
            
            setFormData({
                name: tile.name || '',
                number: tile.number || '',
                size: isCustom ? 'Custom' : (tile.size || ''),
                surface: tile.surface || 'Glossy',
                imageUrl: tile.imageUrl || '',
                publicId: tile.publicId || '',
                conversionFactor: tile.conversionFactor || 1.44,
                restockThreshold: tile.restockThreshold || 0,
                manufacturingFactories: tile.manufacturingFactories?.map(f => f._id || f) || [],
            });
            
            if (tile.imageUrl) setImagePreview(tile.imageUrl);
            if (isCustom) setCustomSize(tile.size);
        }
    }, [tile, isEditMode, uniqueSizes, dataLoading]);

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
                finalImageUrl = uploadResponse?.data?.imageUrl || uploadResponse?.imageUrl;
                finalPublicId = uploadResponse?.data?.publicId || uploadResponse?.publicId;
            }

            const finalSize = formData.size === 'Custom' ? customSize : formData.size;
            if (!finalSize) {
                setError('Size is a required field.');
                setLoading(false);
                return;
            }
            
            const submissionData = {
                name: formData.name,
                number: formData.number,
                surface: formData.surface,
                imageUrl: finalImageUrl,
                publicId: finalPublicId,
                conversionFactor: Number(formData.conversionFactor),
                restockThreshold: Number(formData.restockThreshold),
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
            <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-xl w-full max-w-4xl relative max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border dark:border-dark-border flex-shrink-0">
                    <h1 className="text-2xl font-bold text-text dark:text-dark-text">
                        {isEditMode ? 'Edit Tile' : 'Add New Tile'}
                    </h1>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-background dark:hover:bg-dark-background rounded-lg transition-colors"
                    >
                        <X size={24} className="text-text-secondary" />
                    </button>
                </div>

                {/* Loading State */}
                {dataLoading ? (
                    <div className="flex-grow flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Error */}
                        {error && (
                            <div className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        {/* Form */}
                        <form id="tile-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
                            {/* Image Upload */}
                            <div className="bg-background dark:bg-dark-background p-4 rounded-lg">
                                <Label className="mb-3 block">Tile Image</Label>
                                <div className="flex items-center gap-6">
                                    <div className="w-28 h-28 flex-shrink-0 border-2 border-dashed border-border dark:border-dark-border rounded-lg flex items-center justify-center overflow-hidden bg-foreground dark:bg-dark-foreground">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Image size={36} className="text-text-secondary/30" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label 
                                            htmlFor="file-upload" 
                                            className="cursor-pointer inline-flex items-center gap-2 bg-primary text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                                        >
                                            <UploadCloud size={16} />
                                            <span>Upload Image</span>
                                            <input 
                                                id="file-upload" 
                                                name="file-upload" 
                                                type="file" 
                                                className="sr-only" 
                                                onChange={handleImageChange} 
                                                accept="image/*" 
                                            />
                                        </label>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                                            PNG, JPG, GIF up to 10MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Name & Number */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">
                                        Tile Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        id="name" 
                                        name="name" 
                                        required 
                                        value={formData.name} 
                                        onChange={handleChange}
                                        placeholder="Enter tile name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="number">Tile Number</Label>
                                    <Input 
                                        id="number" 
                                        name="number" 
                                        value={formData.number} 
                                        onChange={handleChange}
                                        placeholder="Optional tile number"
                                    />
                                </div>
                            </div>

                            {/* Manufacturing Factories */}
                            <div>
                                <Label>Manufacturing Factories</Label>
                                <MultiSelectDropdown
                                    options={factoryOptions}
                                    selected={formData.manufacturingFactories}
                                    onChange={handleFactoryChange}
                                    placeholder="Select factories..."
                                />
                            </div>
                            
                            {/* Size, Conversion Factor, Surface */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="size">
                                        Size <span className="text-red-500">*</span>
                                    </Label>
                                    <Select 
                                        id="size" 
                                        name="size" 
                                        value={formData.size} 
                                        onChange={handleChange} 
                                        required
                                    >
                                        <option value="" disabled>Select a size</option>
                                        {uniqueSizes.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                        <option value="Custom">Custom Size</option>
                                    </Select>
                                </div>
                                
                                {formData.size === 'Custom' && (
                                    <div>
                                        <Label htmlFor="customSize">
                                            Custom Size <span className="text-red-500">*</span>
                                        </Label>
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
                                    <Label htmlFor="surface">Surface</Label>
                                    <Select 
                                        id="surface" 
                                        name="surface" 
                                        value={formData.surface} 
                                        onChange={handleChange}
                                    >
                                        <option value="Glossy">Glossy</option>
                                        <option value="Matt">Matt</option>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="conversionFactor">Boxes per Sq.M.</Label>
                                    <Input 
                                        id="conversionFactor" 
                                        name="conversionFactor" 
                                        type="number" 
                                        step="0.01" 
                                        value={formData.conversionFactor} 
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="restockThreshold">Restock Threshold</Label>
                                    <Input 
                                        id="restockThreshold" 
                                        name="restockThreshold" 
                                        type="number" 
                                        min="0"
                                        value={formData.restockThreshold} 
                                        onChange={handleChange}
                                        placeholder="Low stock alert level"
                                    />
                                </div>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="p-6 border-t border-border dark:border-dark-border flex-shrink-0">
                            <div className="flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={onClose} 
                                    className="flex-1 px-4 py-3 border border-border dark:border-dark-border text-text dark:text-dark-text font-semibold rounded-lg hover:bg-background dark:hover:bg-dark-background transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    form="tile-form" 
                                    disabled={loading} 
                                    className="flex-1 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            {isEditMode ? 'Update Tile' : 'Create Tile'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TileFormModal;