import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from '../types';
import { recipeService } from '../services/supabase';

// Pre-defined color palette
const PRESET_COLORS = [
    '#22c55e', '#3b82f6', '#ef4444', '#eab308', '#a855f7', // Row 1
    '#f97316', '#ec4899', '#14b8a6', '#6366f1', '#6b7280'  // Row 2
];

export const ManageTags: React.FC = () => {
    const navigate = useNavigate();
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [tagName, setTagName] = useState('');
    const [tagColor, setTagColor] = useState(PRESET_COLORS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        setLoading(true);
        try {
            const data = await recipeService.getTags();
            setTags(data);
        } catch (err) {
            console.error('Failed to load tags', err);
            // Ideally show a toast here
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (tag?: Tag) => {
        setError(null);
        if (tag) {
            setEditingTag(tag);
            setTagName(tag.name);
            setTagColor(tag.color);
        } else {
            setEditingTag(null);
            setTagName('');
            setTagColor(PRESET_COLORS[0]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTag(null);
        setTagName('');
        setTagColor(PRESET_COLORS[0]);
    };

    const handleSaveTag = async () => {
        setError(null);

        // Validation
        if (tagName.trim().length < 2) {
            setError('Tag name must be at least 2 characters');
            return;
        }

        // Duplicate check
        const isDuplicate = tags.some(t =>
            t.name.toLowerCase() === tagName.trim().toLowerCase() &&
            t.id !== editingTag?.id
        );

        if (isDuplicate) {
            setError('A tag with this name already exists');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingTag) {
                await recipeService.updateTag(editingTag.id, {
                    name: tagName.trim(),
                    color: tagColor
                });
            } else {
                await recipeService.createTag({
                    name: tagName.trim(),
                    color: tagColor
                });
            }
            await loadTags();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save tag', err);
            setError('Failed to save tag. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTag = async (tag: Tag) => {
        if ((tag.recipe_count || 0) > 0) {
            if (!window.confirm(`This tag is used in ${tag.recipe_count} recipes. Deleting it will remove it from those recipes. Are you sure?`)) {
                return;
            }
        } else {
            if (!window.confirm(`Are you sure you want to delete "${tag.name}"?`)) {
                return;
            }
        }

        try {
            await recipeService.deleteTag(tag.id);
            await loadTags();
        } catch (err) {
            console.error('Failed to delete tag', err);
            alert('Failed to delete tag');
        }
    };

    const filteredTags = tags.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                >
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                    <span className="text-sm font-bold hidden sm:inline">Back</span>
                </button>
                <h1 className="font-bold text-lg sm:text-x text-text-dark">Manage Tags</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span className="hidden sm:inline">New Tag</span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
                {/* Subheader: Stats & Search */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-gray-500 font-bold text-sm uppercase tracking-wider">
                        All Tags ({filteredTags.length})
                    </h2>
                    <div className="relative w-full sm:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Filter tags..."
                            className="w-full pl-10 h-10 rounded-xl border-gray-200 text-sm focus:ring-primary/20 focus:border-primary"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="h-16 bg-white rounded-xl animate-pulse"></div>
                        ))
                    ) : filteredTags.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">label_off</span>
                            <p className="text-gray-400 font-medium">No tags found</p>
                            {search && (
                                <button onClick={() => setSearch('')} className="text-primary text-sm font-bold mt-2 hover:underline">Clear filter</button>
                            )}
                        </div>
                    ) : (
                        filteredTags.map(tag => (
                            <div key={tag.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                                    >
                                        <span className="material-symbols-outlined">label</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-dark">{tag.name}</h3>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-mono text-gray-400">{tag.color}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className={`${(tag.recipe_count || 0) > 0 ? 'text-primary font-bold' : 'text-gray-400'}`}>
                                                {tag.recipe_count || 0} recipes
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(tag)}
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTag(tag)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-lg">{editingTag ? 'Edit Tag' : 'New Tag'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {error}
                                </div>
                            )}

                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tag Name</label>
                                <input
                                    type="text"
                                    value={tagName}
                                    onChange={(e) => setTagName(e.target.value)}
                                    placeholder="e.g. Healthy, Spicy, Breakfast"
                                    className="w-full h-12 rounded-xl border-gray-200 focus:ring-primary/20 focus:border-primary font-medium"
                                    autoFocus
                                />
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Color</label>
                                <div className="grid grid-cols-5 gap-3 mb-4">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setTagColor(color)}
                                            className={`h-10 rounded-lg transition-transform hover:scale-105 relative ${tagColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                            style={{ backgroundColor: color }}
                                        >
                                            {tagColor === color && (
                                                <span className="material-symbols-outlined text-white text-sm">check</span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                                    <span className="text-xs text-gray-400 uppercase font-bold">Or Custom</span>
                                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                                </div>

                                <div className="mt-3 flex gap-3">
                                    <div
                                        className="w-12 h-12 rounded-xl border border-gray-200 shadow-sm shrink-0"
                                        style={{ backgroundColor: tagColor }}
                                    ></div>
                                    <input
                                        type="text"
                                        value={tagColor}
                                        onChange={(e) => setTagColor(e.target.value)}
                                        placeholder="#000000"
                                        className="flex-1 rounded-xl border-gray-200 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                                        maxLength={7}
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                    style={{ backgroundColor: `${tagColor}20`, color: tagColor }}
                                >
                                    {tagName || 'Preview'}
                                </span>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 h-12 rounded-xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTag}
                                disabled={isSubmitting}
                                className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {isSubmitting && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
                                Save Tag
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
