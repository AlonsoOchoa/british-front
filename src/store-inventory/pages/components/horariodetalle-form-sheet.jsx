'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { HorarioDetalleService } from '@/services/horariodetalle.service';
import { HorarioService } from '@/services/horario.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';


export function HorarioDetalleFormSheet({
  mode,
  open,
  onOpenChange,
  horarioDetalle,
  onUpdated,
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';
  // 📌 Campos de formulario
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState('');

  // 🔗 Relaciones (Select)
  const [horarioId, setHorarioId] = useState('');

  // 📋 Catálogos
  const [horarios, setHorarios] = useState([]);

  // 🧭 Cargar catálogos al abrir modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [horario] = await Promise.all([
          HorarioService.getAll()
        ]);
        setHorarios(horario);
      } catch (error) {
        console.error('Error cargando catálogos:', error);
        toast.error('⚠️ Error cargando catálogos.');
      }
    };

    if (open) fetchData();
  }, [open]);

  // ✍️ Cargar datos en edición
  useEffect(() => {
    const fetchHorarioDetalleCompleto = async () => {
      try {
        if (isEditMode && horarioDetalle?.id) {
          const horarioDetalleRefrescado = await HorarioDetalleService.getById(horarioDetalle.id);

          // ✅ También actualiza campos básicos si cambian (opcional)
          setNombre(horarioDetalleRefrescado.nombre || '');
          

          setHorarioId(String(horarioDetalleRefrescado.horarioId));
        }
      } catch (error) {
        console.error('⚠️ Error al recargar detalles:', error);
        toast.error('⚠️ Error cargando detalles.');
      }
    };

    fetchHorarioDetalleCompleto();
  }, [open, isEditMode, horarioDetalle?.id]);

  // 🧼 Reset cuando cierras en modo nuevo
  useEffect(() => {
    if (!open && isNewMode) {
      setNombre('');
      setHorarioId('');
    }
  }, [open, isNewMode]);

  // 💾 Guardar
  const handleSave = async () => {
    if (!horarioId.trim() ) {
      toast.error('El detalle debe tener un horario asignado.');
      return;
    }

    const horariodetalleData = {
      nombre,
      horarioId: Number(horarioId),
    };


    try {
      if (isNewMode) {
        const result = await HorarioDetalleService.create(horariodetalleData);
        toast.success('🧾 Detalle creado correctamente');
        onUpdated?.(result);
      } else {
        const result = await HorarioDetalleService.update(horarioDetalle.id, {
          Id: horarioDetalle.id,
          ...horariodetalleData,
        });
        toast.success('✏️ Detalle actualizado correctamente');
        onUpdated?.(result);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el detalle:', error);
      
      toast.error('❌ Error al guardar el detalle.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nuevo Detalle' : 'Editar Detalle'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Horario</Label>
                <Select
                  value={horarioId}
                  onValueChange={setHorarioId}
                  indicatorPosition="right"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Horario" />
                  </SelectTrigger>
                  <SelectContent>
                    {horarios.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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