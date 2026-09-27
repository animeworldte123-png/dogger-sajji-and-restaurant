import React, { useRef, useState } from 'react';
import { Camera, Upload, AlertCircle, Check } from 'lucide-react';
import { readFileAsBase64 } from '../utils/storage';

interface EditableImageProps {
  src: string;
  alt: string;
  onImageChange: (base64Url: string) => void;
  className?: string;
  containerClassName?: string;
  aspectRatioClass?: string;
  labelEn?: string;
  labelUr?: string;
  roundedClass?: string;
  showAlwaysBadge?: boolean;
  clickToEditOnly?: boolean; // When true, only clicking the pencil/camera button triggers picker, allowing parent clicks to bubble
}

export const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  onImageChange,
  className = 'w-full h-full object-cover',
  containerClassName = '',
  aspectRatioClass = 'aspect-4/3',
  labelEn = 'Edit Image',
  labelUr = 'تصویر تبدیل کریں',
  roundedClass = 'rounded-xl',
  showAlwaysBadge = false,
  clickToEditOnly = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [justUpdated, setJustUpdated] = useState(false);
  const [imageError, setImageError] = useState(false);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (JPG, PNG, WebP)');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const base64 = await readFileAsBase64(file);
      onImageChange(base64);
      setImageError(false);
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 2000);
    } catch (err) {
      console.error('File conversion error:', err);
      setErrorMsg('Failed to process image file');
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`group relative overflow-hidden select-none ${aspectRatioClass} ${roundedClass} ${containerClassName} ${
        isDragging ? 'ring-2 ring-amber-500 ring-offset-2' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Actual Image or Fallback */}
      {!imageError && src ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className={`${className} transition-transform duration-300 group-hover:scale-[1.02]`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full bg-linear-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 text-center text-slate-300">
          <Camera className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs font-medium">{alt || 'Dogar Sajji'}</span>
          <span className="text-[11px] font-urdu opacity-75 mt-0.5">ڈوگر سجی اسپیشل</span>
        </div>
      )}

      {/* Discrete Corner Edit Pencil / Camera Switch */}
      <button
        onClick={triggerPicker}
        type="button"
        title={`${labelEn} (${labelUr})`}
        aria-label={`${labelEn} / ${labelUr}`}
        className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/75 hover:bg-amber-500 text-white backdrop-blur-md transition-all shadow-md z-20 opacity-80 group-hover:opacity-100 hover:scale-105 cursor-pointer flex items-center gap-1 border border-white/20"
      >
        <Camera className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold hidden group-hover:inline pr-1">Edit</span>
      </button>

      {/* Dragging or Updating Overlay */}
      {(isDragging || isLoading || justUpdated) && (
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-3 z-30 pointer-events-none"
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-1.5 text-white">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Processing Base64...</span>
            </div>
          ) : justUpdated ? (
            <div className="flex flex-col items-center gap-1 text-emerald-400">
              <Check className="w-6 h-6 animate-bounce" />
              <span className="text-xs font-semibold">Updated! محفوظ ہو گیا</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center text-white gap-1">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center mb-1">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-semibold tracking-wide whitespace-nowrap">Drop File Here</p>
              <p className="text-[11px] font-urdu opacity-90">فائل یہاں چھوڑیں</p>
            </div>
          )}
        </div>
      )}

      {/* Error Alert Toast */}
      {errorMsg && (
        <div className="absolute top-2 left-2 right-2 bg-rose-900/95 text-white text-[11px] px-2.5 py-1.5 rounded-md flex items-center gap-1.5 backdrop-blur-xs z-30 shadow-lg">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-300" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hidden Explorer Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        tabIndex={-1}
      />
    </div>
  );
};
