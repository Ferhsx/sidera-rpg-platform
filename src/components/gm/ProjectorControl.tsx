import React, { useState, useRef } from 'react';
import { Eye, Upload, Zap, Loader2 } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ProjectorControlProps {
    onProject: (url: string) => void;
}

export const ProjectorControl: React.FC<ProjectorControlProps> = ({ onProject }) => {
    const [projectorUrl, setProjectorUrl] = useState("");
    const { uploadImage, isUploading } = useImageUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = await uploadImage(e.target.files[0]);
            if (url) {
                onProject(url);
                alert("Imagem enviada e projetada!");
            }
        }
    };

    const handleProjectImage = () => {
        if (!projectorUrl) return;
        onProject(projectorUrl);
        alert("Imagem projetada nas mentes dos vinculados.");
        setProjectorUrl("");
    };

    return (
        <div className="bg-black/40 p-4 rounded border border-stone-800">
            <label className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-3 block flex items-center gap-2">
                <Eye size={12} className="text-purple-500" /> Projetor Mental (Cenário/Monstro)
            </label>

            <div className="flex flex-col gap-2">
                {/* Input de Arquivo (Escondido) */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                />

                {/* Botão de Upload */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full bg-purple-900/10 hover:bg-purple-900/30 border border-purple-900/30 text-purple-400 py-2 rounded flex items-center justify-center gap-2 text-xs font-bold uppercase transition-all"
                >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Upload & Projetar
                </button>

                {/* Input de URL (Fallback) */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={projectorUrl}
                        onChange={(e) => setProjectorUrl(e.target.value)}
                        placeholder="Ou cole URL..."
                        className="flex-1 bg-stone-900 border border-stone-700 text-stone-300 text-xs p-2 rounded outline-none focus:border-purple-500"
                    />
                    <button
                        onClick={handleProjectImage}
                        className="bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 px-3 rounded"
                    >
                        <Zap size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
