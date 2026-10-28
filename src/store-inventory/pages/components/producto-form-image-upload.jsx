'use client';

import { useState, useCallback, useEffect } from 'react';
import { CloudUpload, ImageIcon, CircleX, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertContent,
  AlertDescription,
} from '@/components/ui/alert';

export function ProductoFormImageUpload({ mode, onImageChange, imagenPreview, maxSize = 5 * 1024 * 1024 }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const simulateUpload = useCallback(() => {
    setProgress(0);
    let value = 0;
    const interval = setInterval(() => {
      value += Math.random() * 20;
      if (value >= 100) {
        value = 100;
        clearInterval(interval);
      }
      setProgress(value);
    }, 120);
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (mode === 'edit' && imagenPreview && !file) {
      setFile({ file: null, preview: imagenPreview });
      setProgress(100);
    }
  }, [mode, imagenPreview, file]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (JPEG o PNG)');
      return;
    }

    if (selected.size > maxSize) {
      setError(`El tamaño máximo permitido es ${formatBytes(maxSize)}.`);
      return;
    }

    setError('');
    const preview = URL.createObjectURL(selected);
    setFile({ file: selected, preview });
    simulateUpload();
    onImageChange?.(selected instanceof File ? selected : selected?.file);
  };

  const removeFile = () => {
    if (file?.preview) URL.revokeObjectURL(file.preview);
    setFile(null);
    setProgress(0);
    onImageChange?.(null);
  };

  return (
    <div className="w-full max-w-4xl">
      {/* 🖼️ Preview & progress */}
      {file && (
        <div className="space-y-3 mb-6">
          <Card className="bg-accent/20 shadow-none rounded-md">
            <CardContent className="flex items-center gap-2 p-3">
              <div className="flex items-center justify-center size-[32px] rounded-md border border-border shrink-0">
                <ImageIcon className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex items-center justify-between gap-2.5 -mt-2 w-full">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-foreground font-medium leading-none">
                      {file.file ? file.file.name : 'Imagen actual'}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal leading-none">
                      {file.file ? formatBytes(file.file.size) : ''}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {progress < 100
                        ? `Subiendo... ${Math.round(progress)}%`
                        : 'Completado ✅'}
                    </p>
                  </div>
                  <Button
                    onClick={removeFile}
                    variant="ghost"
                    size="icon"
                    className="size-6"
                  >
                    <CircleX className="size-3.5" />
                  </Button>
                </div>

                <Progress
                  value={progress}
                  className={cn('h-1 transition-all duration-300', '[&>div]:bg-zinc-950')}
                />
              </div>
            </CardContent>
          </Card>

          {progress >= 100 && (
            <img
              src={file.preview}
              alt="Vista previa"
              className="w-full rounded-md border border-border shadow-sm"
            />
          )}
        </div>
      )}

      {/* 🗂 Área de carga */}
      <Card
        className={cn(
          'border-dashed shadow-none rounded-md bg-accent/20 transition-colors border-muted-foreground/25 hover:border-muted-foreground/50',
        )}
      >
        <CardContent className="text-center">
          <div className="flex items-center justify-center size-[32px] rounded-full border border-border mx-auto mb-3">
            <CloudUpload className="size-4" />
          </div>
          <h3 className="text-2sm text-foreground font-semibold mb-0.5">
            Elige un archivo o arrástralo aquí
          </h3>
          <span className="text-xs text-secondary-foreground font-normal block mb-3">
            JPEG, PNG, hasta {formatBytes(maxSize)}.
          </span>
          <Button size="sm" variant="mono" onClick={() => document.getElementById('fileInput').click()}>
            Subir imagen
          </Button>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* ⚠️ Errores */}
      {error && (
        <Alert variant="destructive" appearance="light" className="mt-5">
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>Error al subir</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </Alert>
      )}
    </div>
  );
}
