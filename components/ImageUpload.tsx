
import React, { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
    onImageSelected: (file: File | null) => void;
    currentImageUrl?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, currentImageUrl }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [stats, setStats] = useState<{ original: number; compressed: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const compressImage = async (file: File) => {
        setIsCompressing(true);
        setError(null);
        setStats(null);

        const options = {
            maxSizeMB: 0.2, // 200KB target
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            fileType: 'image/webp',
            initialQuality: 0.8,
        };

        try {
            let compressedFile = await imageCompression(file, options);

            // Adaptive quality adjustment if still > 300KB
            if (compressedFile.size > 300 * 1024) {
                compressedFile = await imageCompression(file, { ...options, initialQuality: 0.7 });
            }
            if (compressedFile.size > 300 * 1024) {
                compressedFile = await imageCompression(file, { ...options, initialQuality: 0.6, maxWidthOrHeight: 800 });
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(compressedFile);

            setStats({
                original: file.size,
                compressed: compressedFile.size,
            });

            onImageSelected(compressedFile);
        } catch (err) {
            console.error("Compression error:", err);
            setError("Failed to optimize image. Try another photo.");
        } finally {
            setIsCompressing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError("Only images allowed (JPEG, PNG, WebP)");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError("Image too large (max 10MB)");
                return;
            }
            compressImage(file);
        }
    };

    const removeImage = () => {
        setPreviewUrl(null);
        setStats(null);
        setError(null);
        onImageSelected(null);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-4">
            <div className="relative group">
                <label className={`
          aspect-video w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300
          ${previewUrl ? 'border-transparent bg-gray-50' : 'border-gray-200 bg-gray-50 hover:border-primary/50 hover:bg-primary/[0.02]'}
          ${error ? 'border-red-200 bg-red-50' : ''}
        `}>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        capture="environment"
                    />

                    {previewUrl ? (
                        <div className="relative w-full h-full overflow-hidden rounded-2xl group">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white font-bold text-sm bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">Change Photo</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {isCompressing ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
                                    <p className="text-sm font-bold text-primary animate-pulse">Optimizing image...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-gray-400 group-hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-400 group-hover:text-primary/70 transition-colors text-center px-6">
                                        Add cover photo<br />
                                        <span className="text-[10px] font-medium opacity-60">JPEG, PNG, WebP (max 10MB)</span>
                                    </p>
                                </>
                            )}
                        </>
                    )}
                </label>

                {previewUrl && !isCompressing && (
                    <button
                        onClick={removeImage}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                )}
            </div>

            {stats && (
                <div className="bg-green-50/80 backdrop-blur-sm border border-green-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-lg">check</span>
                        </div>
                        <div>
                            <p className="text-xs font-black text-green-700 uppercase tracking-widest">Image Optimized!</p>
                            <p className="text-[10px] text-green-600 font-bold opacity-80">Saved {((1 - stats.compressed / stats.original) * 100).toFixed(0)}% storage</p>
                        </div>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                        <div className="text-gray-400 flex flex-col uppercase tracking-tighter">
                            Original
                            <span className="text-gray-600 normal-case tracking-normal text-sm">{formatSize(stats.original)}</span>
                        </div>
                        <div className="text-right flex flex-col uppercase tracking-tighter text-green-700">
                            Compressed
                            <span className="text-green-600 normal-case tracking-normal text-sm">{formatSize(stats.compressed)}</span>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
                    <span className="material-symbols-outlined text-lg">error</span>
                    {error}
                </div>
            )}
        </div>
    );
};
