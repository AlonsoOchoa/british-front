'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { EmpleadoService } from '@/services/empleado.service';
import { VendedorService } from '@/services/vendedor.service';
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


export function VendedorFormSheet({
  mode,
  open,
  onOpenChange,
  vendedor,
  onUpdated,
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';
  // 📌 Campos de formulario
  const [codigo, setCodigo] = useState('');
  const [comision, setComision] = useState('');
  const [metaMensual, setMetaMensual] = useState('');
  const [estado, setEstado] = useState('');

  // 🔗 Relaciones (Select)
  const [empleadoId, setEmpleadoId] = useState('');

  // 📋 Catálogos
  const [empleados, setEmpleados] = useState([]);

  // 🧭 Cargar catálogos al abrir modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empleado] = await Promise.all([
          EmpleadoService.getAll(),
        ]);
        setEmpleados(empleado);
      } catch (error) {
        console.error('Error cargando catálogos:', error);
        toast.error('⚠️ Error cargando catálogos.');
      }
    };

    if (open) fetchData();
  }, [open]);

  // ✍️ Cargar datos en edición
  useEffect(() => {
    const fetchVendedorCompleto = async () => {
      try {
        if (isEditMode && vendedor?.id) {
          const vendedorRefrescado = await VendedorService.getById(vendedor.id);

          // ✅ También actualiza campos básicos si cambian (opcional)
          setCodigo(vendedorRefrescado.codigo || '');
          setComision(vendedorRefrescado.comision || '');
          setMetaMensual(vendedorRefrescado.metaMensual || '');
          setEstado(vendedorRefrescado.estado || '');
          

          setEmpleadoId(String(vendedorRefrescado.empleadoId));
        }
      } catch (error) {
        console.error('⚠️ Error al recargar vendedor:', error);
        toast.error('⚠️ Error cargando vendedores.');
      }
    };

    fetchVendedorCompleto();
  }, [open, isEditMode, vendedor?.id]);

  // 🧼 Reset cuando cierras en modo nuevo
  useEffect(() => {
    if (!open && isNewMode) {
      setCodigo('');
      setComision('');
      setMetaMensual('');
      setEstado('')
      setEmpleadoId('');
    }
  }, [open, isNewMode]);

  // 💾 Guardar
  const handleSave = async () => {
    if (!empleadoId.trim()) {
      toast.error('El vendedor debe tener asignado un colaborador.');
      return;
    }

    const vendedorData = {
      codigo,
      comision,
      metaMensual,
      estado,
      empleadoId: Number(empleadoId),
    };


    try {
      if (isNewMode) {
        const result = await VendedorService.create(vendedorData);
        toast.success('🧾 Vendedor creado correctamente');
        onUpdated?.(result);
      } else {
        const result = await VendedorService.update(vendedor.id, {
          Id: vendedor.id,
          ...vendedorData,
        });
        toast.success('✏️ Vendedor actualizado correctamente');
        onUpdated?.(result);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el vendedor:', error);
      if (error?.response?.status === 409) {
        toast.error(error.response.data || 'El empleado ya está asignado a otro vendedor.');
        return;
      }

      if (error?.response?.data) {
        toast.error(typeof error.response.data === 'string'
          ? error.response.data
          : 'Ocurrió un error al guardar el vendedor.');
        return;
      }
      toast.error('❌ Error al guardar el vendedor.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nuevo Vendedor' : 'Editar Vendedor'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Empleado</Label>
                <Select
                  value={empleadoId || 'none'}
                  onValueChange={(value) => {
                    setEmpleadoId(value === 'none' ? '' : value);
                  }}
                  indicatorPosition="right"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Empleado" />
                  </SelectTrigger>

                  <SelectContent>
                    {/* opción para limpiar */}

                    {empleados.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {`${c.nombres} ${c.apellidos ?? ''}`.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Codigo</Label>
                <Input
                  placeholder="Codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Comision</Label>
                <Input
                  placeholder="Comision"
                  value={comision}
                  onChange={(e) => setComision(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Meta Mensual</Label>
                <Input
                  placeholder="Meta mensual"
                  value={metaMensual}
                  onChange={(e) => setMetaMensual(e.target.value)}
                />
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="border-t p-5">
          <div className="flex items-center justify-between w-full">
            {/* 🔹 IZQUIERDA: COMBO */}
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Activo</SelectItem>
                <SelectItem value="1">Inactivo</SelectItem>
              </SelectContent>
            </Select>

            {/* 🔹 DERECHA: BOTONES */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Salir
              </Button>
              <Button variant="mono" onClick={handleSave}>
                {isNewMode ? 'Crear' : 'Guardar'}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}