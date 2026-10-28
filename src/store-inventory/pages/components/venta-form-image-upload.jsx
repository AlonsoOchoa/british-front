'use client';

import { useRef } from 'react';
import { Eye, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';


export function VentaFormImageUpload({
  mode,
  comprobantesActuales = [],
  setComprobantesActuales,
  nuevosComprobantes = [],
  setNuevosComprobantes,
  comprobantesEliminarIds = [],
  setComprobantesEliminarIds,
  maxFiles = 3,
}) {
  const inputRef = useRef(null);
  const isEditMode = mode === 'edit';

  const totalArchivos = comprobantesActuales.length + nuevosComprobantes.length;

  const handleSelectFiles = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const espacioDisponible = maxFiles - totalArchivos;

    if (espacioDisponible <= 0) {
      toast.error(`Solo se permiten máximo ${maxFiles} comprobantes.`);
      e.target.value = '';
      return;
    }

    const archivosValidos = files.slice(0, espacioDisponible);

    const archivosConPreview = archivosValidos.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      nombreArchivo: file.name,
      tipoArchivo: file.type,
    }));

    setNuevosComprobantes((prev) => [...prev, ...archivosConPreview]);
    e.target.value = '';
  };

  const quitarNuevo = (id) => {
    setNuevosComprobantes((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const quitarActual = (id) => {
    setComprobantesEliminarIds((prev) => [...prev, id]);
    setComprobantesActuales((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Comprobantes</Label>
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={totalArchivos >= maxFiles}
        >
          Agregar archivo
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleSelectFiles}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Máximo {maxFiles} comprobantes. En registro al menos 1.
      </p>

      {(comprobantesActuales.length > 0 || nuevosComprobantes.length > 0) && (
        <div className="grid grid-cols-1 gap-4">
          {comprobantesActuales.map((item) => (
            <div
              key={`actual-${item.id}`}
              className="relative border rounded-md overflow-hidden shadow-sm bg-white"
            >
              <div className="flex items-center justify-center bg-muted/20">
                <img
                  src={`${import.meta.env.VITE_API_URL}/Venta/comprobante/${item.id}`}
                  alt={item.nombreArchivo}
                  className="w-full max-h-[420px] object-contain"
                  onError={() => console.error('Error cargando imagen:', item.id)}
                />
              </div>

              <div className="p-2 text-[11px] truncate">
                {item.nombreArchivo}
              </div>

              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_API_URL}/Venta/comprobante/${item.id}`,
                      '_blank',
                    )
                  }
                >
                  <Eye className="size-4" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => quitarActual(item.id)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ))}

          {nuevosComprobantes.map((item) => (
            <div
              key={item.id}
              className="relative border rounded-md overflow-hidden shadow-sm bg-white"
            >
              <div className="flex items-center justify-center bg-muted/20">
                <img
                  src={item.preview}
                  alt={item.nombreArchivo}
                  className="w-full max-h-[420px] object-contain"
                />
              </div>

              <div className="p-2 text-[11px] truncate">
                {item.nombreArchivo}
              </div>

              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => quitarNuevo(item.id)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {comprobantesActuales.length === 0 && nuevosComprobantes.length === 0 && (
        <div className="border border-dashed rounded-md p-6 text-center text-sm text-muted-foreground">
          <div className="flex justify-center mb-2">
            <ImageIcon className="size-5" />
          </div>
          No hay comprobantes cargados
        </div>
      )}
    </div>
  );
}