import React, { useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  url: string;
  isUploading: boolean;
  onUrlChange: (url: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  uploadThumbnail: (file: File) => Promise<string>;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  url,
  isUploading,
  onUrlChange,
  onUploadStart,
  onUploadEnd,
  uploadThumbnail
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onUploadStart();
    try {
      const newUrl = await uploadThumbnail(file);
      onUrlChange(newUrl);
    } catch (error) {
      console.error('Upload Error:', error);
    } finally {
      onUploadEnd();
    }
  };

  return (
    <div className="flex-shrink-0">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative w-32 h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden group"
        id="thumbnail-upload-zone"
      >
        {url ? (
          <img 
            src={url} 
            alt="Thumbnail" 
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
                <span className="text-xs text-gray-500 px-2 text-center">Add Photo</span>
              </>
            )}
          </>
        )}
        {url && !isUploading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        )}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
