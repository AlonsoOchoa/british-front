'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { AreaService } from '@/services/area.service';
import { EmpresaService } from '@/services/empresa.service';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';


export function AreaFormSheet({ mode, open, onOpenChange, area, onUpdated }) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';
  const [empresaId, setEmpresaId] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    if (isEditMode && area) {
      setEmpresaId(String(area.empresaId));
      setNombre(area.nombre || '');
      setDescripcion(area.descripcion || '');
    }
  }, [area, isEditMode]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast.error('El nombre del área es obligatorio.');
      return;
    }
    try {
      if (isNewMode) {
        const result = await AreaService.create({ EmpresaId: Number(empresaId), 
          Nombre: nombre,
          Descripcion: descripcion});
        toast.success('📦 Área creada correctamente');
        onUpdated?.(result);
      } else {
        const result = await AreaService.update(area.id, { 
          Id: area.id, 
          EmpresaId: Number(empresaId), 
          Nombre: nombre,
          Descripcion: descripcion });
        toast.success('✏️ Área actualizada correctamente');
        onUpdated?.(result);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el área:', error);
      toast.error('❌ Error al guardar el área.');
    }
  };

  useEffect(() => {
    if (!open && isNewMode) {
      setEmpresaId('');
      setNombre('');
      setDescripcion('');
    }
  }, [open, isNewMode]);

    // 🧭 Cargar catálogos al abrir modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emp] = await Promise.all([
          EmpresaService.getAll(),
        ]);
        setEmpresas(emp);
      } catch (error) {
        console.error('Error cargando empresas:', error);
        toast.error('⚠️ Error cargando empresas.');
      }
    };

    if (open) fetchData();
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nueva Área' : 'Editar Área'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow">
            <div className="space-y-6">
              <div>
                <Label className="text-xs">Área</Label>
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

              <div className="space-y-2">
                <Label className="text-xs font-medium">Descripción</Label>
                <Input
                  placeholder="Descripción"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
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