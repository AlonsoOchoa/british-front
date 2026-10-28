'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { NivelService } from '@/services/nivel.service';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

export function NivelFormSheet({ mode, open, onOpenChange, nivel, onUpdated }) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    if (isEditMode && nivel) {
      setNombre(nivel.nombre || '');
    }
  }, [nivel, isEditMode]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast.error('El nombre del nivel es obligatorio.');
      return;
    }
    try {
      if (isNewMode) {
        const result = await NivelService.create({ Nombre: nombre });
        toast.success('📦 Nivel creado correctamente');
        onUpdated?.(result);
      } else {
        await NivelService.update(nivel.id, { Id: nivel.id, Nombre: nombre });
        toast.success('✏️ Nivel actualizado correctamente');
        onUpdated?.({ ...nivel, nombre });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el nivel:', error);
      toast.error('❌ Error al guardar el nivel.');
    }
  };

  useEffect(() => {
    if (!open && isNewMode) setNombre('');
  }, [open, isNewMode]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nuevo Nivel' : 'Editar Nivel'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Nombre</Label>
                <Input
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
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
