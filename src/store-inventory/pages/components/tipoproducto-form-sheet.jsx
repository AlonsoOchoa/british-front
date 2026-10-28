'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TipoProductoService } from '@/services/tipoproducto.service';
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

export function TipoProductoFormSheet({ mode, open, onOpenChange, tipoproducto, onUpdated }) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // 🪝 Cargar datos si está en modo edición
  useEffect(() => {
    if (isEditMode && tipoproducto) {
      setNombre(tipoproducto.nombre || '');
      setDescripcion(tipoproducto.descripcion || '');
    }
  }, [tipoproducto, isEditMode]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast.error('El nombre del tipo producto es obligatorio.');
      return;
    }

    try {
      if (isNewMode) {
        const result = await TipoProductoService.create({
          Nombre: nombre,
          Descripcion: descripcion,
        });
        toast.success('🏷️ Tipo de Producto creado correctamente');
        onUpdated?.(result);
      } else {
        await TipoProductoService.update(tipoproducto.id, {
          Id: tipoproducto.id,
          Nombre: nombre,
          Descripcion: descripcion,
        });
        toast.success('✏️ tipo de producto actualizado correctamente');
        onUpdated?.({ ...tipoproducto, nombre, descripcion });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el tipo de producto:', error);
      toast.error('❌ Error al guardar el tipo de producto.');
    }
  };

  // 🧼 Reset cuando se cierra si es nuevo
  useEffect(() => {
    if (!open && isNewMode) {
      setNombre('');
      setDescripcion('');
    }
  }, [open, isNewMode]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nuevo Tipo de Prducto' : 'Editar Tipo de Producto'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow">
            <div className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Nombre</Label>
                <Input
                  placeholder="Nombre del tipo de producto"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Descripción</Label>
                <Textarea
                  placeholder="Descripción del tipo de producto"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={4}
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
