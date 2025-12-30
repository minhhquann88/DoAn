'use client';

import React from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string; // Current image URL
  onChange: (url: string) => void;
  onUpload?: (file: File) => Promise<string>; // Upload function that returns image URL
  disabled?: boolean;
  className?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  disabled = false,
  className,
  label = 'Ảnh bìa',
  accept = 'image/*',
  maxSize = 10,
}: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(value || null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Kích thước file không được vượt quá ${maxSize}MB`);
      return;
    }

    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file if onUpload is provided
    if (onUpload) {
      setIsUploading(true);
      try {
        const imageUrl = await onUpload(file);
        onChange(imageUrl);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi upload ảnh');
        setPreview(value || null); // Revert to previous image
      } finally {
        setIsUploading(false);
      }
    } else {
      // If no upload function, just use the preview (for URL input mode)
      onChange('');
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      <div className="space-y-2">
        {preview ? (
          <div className="relative aspect-video w-full rounded-md border border-input overflow-hidden bg-muted">
            {preview.startsWith('http://localhost') || preview.startsWith('http://127.0.0.1') ? (
              // Sử dụng thẻ img thông thường cho localhost để tránh lỗi private IP
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-sm text-muted-foreground">Đang upload...</div>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={handleClick}
            className={cn(
              'relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
              disabled
                ? 'border-muted bg-muted cursor-not-allowed opacity-50'
                : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">Đang upload...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                <div className="text-sm text-center">
                  <span className="font-medium text-primary">Click để upload</span> hoặc kéo thả
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF tối đa {maxSize}MB
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {!preview && !disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isUploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Chọn ảnh
          </Button>
        )}
      </div>
    </div>
  );
}

