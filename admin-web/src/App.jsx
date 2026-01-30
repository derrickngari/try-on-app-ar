import React, { useState } from 'react';
import ProductForm from './components/ProductForm';
import { LayoutDashboard, PlusCircle, Package } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('add-product');

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <Package className="w-8 h-8" />
                        Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard'
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </button>

                    <button
                        onClick={() => setActiveTab('add-product')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'add-product'
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <PlusCircle size={20} />
                        Add Product
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-200 p-4 md:hidden">
                    <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
                </header>

                <div className="p-6 max-w-5xl mx-auto">
                    {activeTab === 'add-product' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                                <p className="text-gray-500">Upload a new item to the store catalog.</p>
                            </div>
                            <ProductForm />
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                            <LayoutDashboard size={48} className="mb-4 opacity-50" />
                            <p className="text-lg">Dashboard stats coming soon...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
