import React, { useRef, useState, useEffect } from 'react';
import { Camera, Loader2, Upload, Clipboard, X } from 'lucide-react';
import { resizeImage } from '../../../utils/imageUtils';
import { motion, AnimatePresence } from 'motion/react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsModalOpen(false);
    onUploadStart();
    try {
      const resizedFile = await resizeImage(file, 800, 800);
      const newUrl = await uploadThumbnail(resizedFile);
      onUrlChange(newUrl);
    } catch (error) {
      console.error('Upload Error:', error);
    } finally {
      onUploadEnd();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    if (!isModalOpen) return;
    
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          break;
        }
      }
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      window.addEventListener('paste', handlePaste);
    } else {
      window.removeEventListener('paste', handlePaste);
    }
    return () => window.removeEventListener('paste', handlePaste);
  }, [isModalOpen]);

  return (
    <div className="flex-shrink-0">
      <div 
        onClick={() => setIsModalOpen(true)}
        className="relative w-32 h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden group outline-none focus:ring-2 focus:ring-blue-500"
        id="thumbnail-upload-trigger"
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
                <span className="text-xs text-gray-500 px-2 text-center font-bold">Add Photo</span>
              </>
            )}
          </>
        )}
        {url && !isUploading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Upload Image</h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center">
                    <Clipboard className="w-12 h-12 text-blue-500 mb-4 animate-pulse" />
                    <p className="text-sm font-medium text-gray-900">Paste image from clipboard</p>
                    <p className="text-xs text-gray-500 mt-1">Press Ctrl+V or Command+V</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500 font-bold italic">Or</span>
                    </div>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all font-bold"
                  >
                    <Upload className="w-5 h-5" />
                    Choose File
                  </button>
                </div>
              </div>

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
