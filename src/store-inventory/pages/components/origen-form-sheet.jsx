'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { EmpresaService } from '@/services/empresa.service';
import { OrigenService } from '@/services/origen.service';
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


export function OrigenFormSheet({
  mode,
  open,
  onOpenChange,
  origen,
  onUpdated,
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';
  // 📌 Campos de formulario
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState('');

  // 🔗 Relaciones (Select)
  const [empresaId, setEmpresaId] = useState('');

  // 📋 Catálogos
  const [empresas, setEmpresas] = useState([]);

  // 🧭 Cargar catálogos al abrir modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empresa] = await Promise.all([
          EmpresaService.getAll(),
        ]);
        setEmpresas(empresa);
      } catch (error) {
        console.error('Error cargando catálogos:', error);
        toast.error('⚠️ Error cargando catálogos.');
      }
    };

    if (open) fetchData();
  }, [open]);

  // ✍️ Cargar datos en edición
  useEffect(() => {
    const fetchOrigenCompleto = async () => {
      try {
        if (isEditMode && origen?.id) {
          const origenRefrescado = await OrigenService.getById(origen.id);

          // ✅ También actualiza campos básicos si cambian (opcional)
          setNombre(origenRefrescado.nombre || '');
          setEstado(origenRefrescado.estado || '');
          

          setEmpresaId(String(origenRefrescado.empresaId));
        }
      } catch (error) {
        console.error('⚠️ Error al recargar origen:', error);
        toast.error('⚠️ Error cargando origenes.');
      }
    };

    fetchOrigenCompleto();
  }, [open, isEditMode, origen?.id]);

  // 🧼 Reset cuando cierras en modo nuevo
  useEffect(() => {
    if (!open && isNewMode) {
      setNombre('');
      setEstado('');
      setEmpresaId('');
    }
  }, [open, isNewMode]);

  // 💾 Guardar
  const handleSave = async () => {
    if (!empresaId.trim()) {
      toast.error('El origen debe tener una empresa asignada.');
      return;
    }

    const origenData = {
      nombre,
      empresaId: Number(empresaId),
    };


    try {
      if (isNewMode) {
        const result = await OrigenService.create(origenData);
        toast.success('🧾 Origen creado correctamente');
        onUpdated?.(result);
      } else {
        const result = await OrigenService.update(origen.id, {
          Id: origen.id,
          ...origenData,
        });
        toast.success('✏️ Origen actualizado correctamente');
        onUpdated?.(result);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el origen:', error);
      
      toast.error('❌ Error al guardar el origen.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nuevo Origen' : 'Editar Origen'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Empresa</Label>
                <Select
                  value={empresaId}
                  onValueChange={setEmpresaId}
                  indicatorPosition="right"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.nombreComercial}
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