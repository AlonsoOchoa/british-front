'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { OrigenService } from '@/services/origen.service';
import { SubOrigenService } from '@/services/suborigen.service';
import { SucursalService } from '@/services/sucursal.service';
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


export function SubOrigenFormSheet({
  mode,
  open,
  onOpenChange,
  suborigen,
  onUpdated,
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';
  // 📌 Campos de formulario
  const [nombre, setNombre] = useState('');
  const [multiplicador, setMultiplicador] = useState('');
  const [estado, setEstado] = useState('');

  // 🔗 Relaciones (Select)
  const [sucursalId, setSucursalId] = useState('');
  const [origenId, setOrigenId] = useState('');

  // 📋 Catálogos
  const [sucursales, setSucursales] = useState([]);
  const [origenes, setOrigenes] = useState([]);

  // 🧭 Cargar catálogos al abrir modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sucursal, origen] = await Promise.all([
          SucursalService.getAll(),
          OrigenService.getAll(),
        ]);
        setSucursales(sucursal);
        setOrigenes(origen)
      } catch (error) {
        console.error('Error cargando catálogos:', error);
        toast.error('⚠️ Error cargando catálogos.');
      }
    };

    if (open) fetchData();
  }, [open]);

  // ✍️ Cargar datos en edición
  useEffect(() => {
    const fetchSubOrigenCompleto = async () => {
      try {
        if (isEditMode && suborigen?.id) {
          const suborigenRefrescado = await SubOrigenService.getById(suborigen.id);

          // ✅ También actualiza campos básicos si cambian (opcional)
          setNombre(suborigenRefrescado.nombre || '');
          setMultiplicador(suborigenRefrescado.multiplicador || '');
          setEstado(suborigenRefrescado.estado || '');
          

          setSucursalId(String(suborigenRefrescado.sucursalId));
          setOrigenId(String(suborigenRefrescado.origenId));
        }
      } catch (error) {
        console.error('⚠️ Error al recargar suborigen:', error);
        toast.error('⚠️ Error cargando suborigenes.');
      }
    };

    fetchSubOrigenCompleto();
  }, [open, isEditMode, suborigen?.id]);

  // 🧼 Reset cuando cierras en modo nuevo
  useEffect(() => {
    if (!open && isNewMode) {
      setNombre('');
      setMultiplicador('');
      setEstado('');
      setSucursalId('');
      setOrigenId('');
    }
  }, [open, isNewMode]);

  // 💾 Guardar
  const handleSave = async () => {
    if (!sucursalId.trim() ) {
      toast.error('El origen debe tener una sucursal asignada.');
      return;
    }
    if (!origenId.trim() ) {
      toast.error('El origen debe tener un origen asignado.');
      return;
    }

    const suborigenData = {
      nombre,
      multiplicador,
      sucursalId: Number(sucursalId),
      origenId: Number(origenId),
    };


    try {
      if (isNewMode) {
        const result = await SubOrigenService.create(suborigenData);
        toast.success('🧾 SubOrigen creado correctamente');
        onUpdated?.(result);
      } else {
        const result = await SubOrigenService.update(suborigen.id, {
          Id: suborigen.id,
          ...suborigenData,
        });
        toast.success('✏️ SubOrigen actualizado correctamente');
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
            {isNewMode ? 'Nuevo SubOrigen' : 'Editar SubOrigen'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Sucursal</Label>
                <Select
                  value={sucursalId}
                  onValueChange={setSucursalId}
                  indicatorPosition="right"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Sucursal" />
                  </SelectTrigger>
                  <SelectContent>
                    {sucursales.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Origen</Label>
                <Select
                  value={origenId}
                  onValueChange={setOrigenId}
                  indicatorPosition="right"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Origen" />
                  </SelectTrigger>
                  <SelectContent>
                    {origenes.map((a) => (
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
              <div className="space-y-2">
                <Label className="text-xs font-medium">Multiplicador</Label>
                <Input
                  placeholder="Multiplicador"
                  value={multiplicador}
                  onChange={(e) => setMultiplicador(e.target.value)}
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