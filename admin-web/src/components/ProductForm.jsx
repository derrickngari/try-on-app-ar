import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Check, AlertCircle } from 'lucide-react';

const CATEGORIES = ["Armchair", "Dining Chair", "Sofa", "Table", "Lamp"];

export default function ProductForm() {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: CATEGORIES[0],
        description: '',
        image: '',
        badge: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Basic validation
            if (!formData.name || !formData.price || !formData.description || !formData.image) {
                throw new Error("Please fill in all required fields");
            }

            const payload = {
                ...formData,
                price: Number(formData.price),
                images: [formData.image], // Add main image to images array
                colors: [], // Default empty for now
                materials: [] // Default empty for now
            };

            // Assuming backend is running on localhost:5000
            const response = await axios.post('http://localhost:5000/api/products', payload);

            if (response.data.success) {
                setStatus({ type: 'success', message: 'Product created successfully!' });
                setFormData({
                    name: '',
                    price: '',
                    category: CATEGORIES[0],
                    description: '',
                    image: '',
                    badge: ''
                });
            }
        } catch (error) {
            console.error("Error creating product:", error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || error.message || 'Failed to create product'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {status.message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {status.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                    <p className="font-medium">{status.message}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="e.g. Modern Sofa"
                            required
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (Ksh) *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="e.g. 25000"
                            min="0"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Badge */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Badge (Optional)</label>
                        <input
                            type="text"
                            name="badge"
                            value={formData.badge}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="e.g. New Arrival"
                        />
                    </div>
                </div>

                {/* Image URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                    <div className="flex gap-4">
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="https://example.com/image.jpg"
                            required
                        />
                    </div>
                    {formData.image && (
                        <div className="mt-4 w-32 h-32 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                            <img
                                src={formData.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                        placeholder="Describe the product..."
                        required
                    ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-3 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/40 active:scale-95 transition-all flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Upload size={20} />
                                Upload Product
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
