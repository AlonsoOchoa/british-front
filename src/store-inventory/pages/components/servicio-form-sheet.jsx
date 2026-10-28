'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ServicioService } from '@/services/servicio.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

export function ServicioFormSheet({ mode, open, onOpenChange, servicio, onUpdated }) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');

  // 🪝 Cargar datos si está en modo edición
  useEffect(() => {
    if (isEditMode && servicio) {
      setNombre(servicio.nombre || '');
      setDescripcion(servicio.descripcion || '');
      setPrecio(servicio.precio || '');
    }
  }, [servicio, isEditMode]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast.error('El nombre del servicio es obligatorio.');
      return;
    }
    if (!precio || isNaN(precio)) {
      toast.error('El precio debe ser un número válido.');
      return;
    }

    try {
      if (isNewMode) {
        const result = await ServicioService.create({
          Nombre: nombre,
          Descripcion: descripcion,
          Precio: precio,
        });
        toast.success('🧾 Servicio creado correctamente');
        onUpdated?.(result);
      } else {
        await ServicioService.update(servicio.id, {
          Id: servicio.id,
          Nombre: nombre,
          Descripcion: descripcion,
          Precio: precio,
        });
        toast.success('✏️ servicio actualizado correctamente');
        onUpdated?.({ ...servicio, nombre, descripcion, precio });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el servicio:', error);
      toast.error('❌ Error al guardar el servicio.');
    }
  };

  // 🧼 Reset cuando se cierra si es nuevo
  useEffect(() => {
    if (!open && isNewMode) {
      setNombre('');
      setDescripcion('');
      setPrecio('');
    }
  }, [open, isNewMode]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nuevo Servicio' : 'Editar Servicio'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow">
            <div className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Nombre</Label>
                <Input
                  placeholder="Nombre del servicio"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Descripción</Label>
                <Textarea
                  placeholder="Descripción del servicio"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Precio (S/)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="border-t p-5">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Salir
            </Button>
            <Button variant="mono" onClick={handleSave}>
              {isNewMode ? 'Crear' : 'Guardar'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
