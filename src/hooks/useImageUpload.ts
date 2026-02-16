import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useImageUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadImage = async (file: File): Promise<string | null> => {
        // Validação básica (Max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("O arquivo é muito grande! Máximo 2MB.");
            return null;
        }

        setIsUploading(true);
        try {
            // 1. Criar um nome único para o arquivo
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            // 2. Upload para o Supabase
            // IMPORTANTE: O bucket 'sidera-uploads' precisa existir e ser público
            const { error: uploadError } = await supabase.storage
                .from('sidera-uploads')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 3. Pegar a URL pública
            const { data } = supabase.storage
                .from('sidera-uploads')
                .getPublicUrl(filePath);

            return data.publicUrl;

        } catch (error: any) {
            alert("Erro no upload: " + (error.message || "Falha desconhecida"));
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return { uploadImage, isUploading };
};
