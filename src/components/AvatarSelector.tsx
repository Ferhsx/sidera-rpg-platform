import React, { useRef, useState } from 'react';
import { User, Camera, Upload, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import { useCharacter } from '@/contexts/CharacterContext';
import { useImageUpload } from '@/hooks/useImageUpload';

export const AvatarSelector: React.FC = () => {
    const { character, updateCharacter } = useCharacter();
    const { uploadImage, isUploading } = useImageUpload();

    const [isEditing, setIsEditing] = useState(false);
    const [tempUrl, setTempUrl] = useState(character.imageUrl || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        updateCharacter({ imageUrl: tempUrl });
        setIsEditing(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const publicUrl = await uploadImage(file);

            if (publicUrl) {
                updateCharacter({ imageUrl: publicUrl });
                setIsEditing(false);
            }
        }
    };

    return (
        <div className="relative group w-32 h-32 mx-auto md:mx-0 mb-4 z-20">
            {/* Visual do Avatar */}
            <div className="w-full h-full rounded-sm overflow-hidden border border-stone-600 bg-stone-900 relative shadow-lg">
                {character.imageUrl ? (
                    <img
                        src={character.imageUrl}
                        alt="Retrato"
                        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 filter sepia-[0.3] contrast-125 grayscale-[0.3] ${isUploading ? 'opacity-50' : ''}`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-700">
                        <User size={48} strokeWidth={1} />
                    </div>
                )}

                {/* Textura de Sujeira */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-30 pointer-events-none mix-blend-overlay"></div>

                {/* Loading Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="animate-spin text-rust" />
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 bg-stone-800 text-gold p-1.5 border border-stone-600 opacity-0 group-hover:opacity-100 transition-opacity z-30"
                title="Alterar Retrato"
            >
                <Camera size={14} />
            </button>

            {/* Modal de Edição */}
            {isEditing && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-stone-900 border border-rust p-3 w-72 shadow-2xl rounded-sm animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => setIsEditing(false)} className="absolute top-1 right-1 text-stone-500 hover:text-white"><X size={12} /></button>

                    <div className="space-y-3">
                        {/* Opção 1: Upload */}
                        <div>
                            <label className="text-[10px] text-rust uppercase tracking-widest mb-1 block">Enviar Arquivo</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-300 py-2 flex items-center justify-center gap-2 text-xs font-bold transition-colors"
                            >
                                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                Escolher do Dispositivo
                            </button>
                        </div>

                        <div className="text-center text-[10px] text-stone-600 uppercase">- OU -</div>

                        {/* Opção 2: Link */}
                        <div>
                            <label className="text-[10px] text-stone-500 uppercase tracking-widest mb-1 block">Colar Link</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tempUrl}
                                    onChange={(e) => setTempUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-black border border-stone-700 text-xs p-1 text-stone-300 focus:border-gold outline-none"
                                />
                                <button onClick={handleSave} className="bg-stone-700 hover:bg-gold hover:text-black text-white px-2 text-xs font-bold">OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
