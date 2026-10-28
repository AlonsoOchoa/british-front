'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { SucursalService } from '@/services/sucursal.service';
import { EmpresaService } from '@/services/empresa.service';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';


export function SucursalFormSheet({ mode, open, onOpenChange, sucursal, onUpdated }) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';
  const [empresaId, setEmpresaId] = useState('');
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    if (isEditMode && sucursal) {
      setEmpresaId(String(sucursal.empresaId));
      setNombre(sucursal.nombre || '');
      setDireccion(sucursal.direccion || '');
      setCiudad(sucursal.ciudad || '');
      setTelefono(sucursal.telefono || '');
    }
  }, [sucursal, isEditMode]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast.error('El nombre de la sucursal es obligatorio.');
      return;
    }
    try {
      if (isNewMode) {
        const result = await SucursalService.create({ EmpresaId: Number(empresaId), 
          Nombre: nombre,
          Direccion: direccion,
          Ciudad: ciudad,
          Telefono: telefono });
        toast.success('📦 Almacén creado correctamente');
        onUpdated?.(result);
      } else {
        const result = await SucursalService.update(sucursal.id, { Id: sucursal.id, EmpresaId: Number(empresaId), 
          Nombre: nombre,
          Direccion: direccion,
          Ciudad: ciudad,
          Telefono: telefono });
        toast.success('✏️ Almacén actualizado correctamente');
        onUpdated?.(result);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el almacén:', error);
      toast.error('❌ Error al guardar el almacén.');
    }
  };

  useEffect(() => {
    if (!open && isNewMode) {
      setEmpresaId('');
      setNombre('');
      setDireccion('');
      setCiudad('');
      setTelefono('');
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
            {isNewMode ? 'Nueva Sucursal' : 'Editar Sucursal'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow">
            <div className="space-y-6">
              <div>
                <Label className="text-xs">Empresa</Label>
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
                <Label className="text-xs font-medium">Dirección</Label>
                <Input
                  placeholder="Dirección"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Ciudad</Label>
                <Input
                  placeholder="Ciudad"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Celular</Label>
                <Input
                  placeholder="Celular"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
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