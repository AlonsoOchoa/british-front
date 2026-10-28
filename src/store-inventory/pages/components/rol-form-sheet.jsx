'use client';

import { useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { PermisoService } from '@/services/permiso.service';
import { RolService } from '@/services/rol.service';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export function RolFormSheet({ mode, open, onOpenChange, rol, onUpdated }) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [nombre, setNombre] = useState('');
  const [permisos, setPermisos] = useState([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);

  // 🔹 Cargar permisos desde API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await PermisoService.getAll();
        setPermisos(data);

        if (isEditMode && rol?.id) {
        const rolActualizado = await RolService.getById(rol.id);
        const ids = rolActualizado.rolPermisos.map((rp) => rp.permisoId);
        setPermisosSeleccionados(ids);
      }
      } catch (error) {
        console.error('Error cargando permisos:', error);
        toast.error('⚠️ Error cargando permisos.');
      }
    };

    if (open) fetchData();
  }, [open, rol, isEditMode]);

  // 🔹 Actualizar campos al abrir
  useEffect(() => {
    if (isEditMode && rol) {
      setNombre(rol.nombre || '');
    }
    if (isNewMode && open) {
      setNombre('');
      setPermisosSeleccionados([]);
    }
  }, [rol, isEditMode, isNewMode, open]);

  // ✅ Agrupar permisos por módulo usando tus campos reales
  const permisosAgrupados = useMemo(() => {
    const grupos = {};
    permisos.forEach((p) => {
      const modulo = p.modulo || 'Otros';
      const accion = p.accion || 'Sin acción';

      if (!grupos[modulo]) grupos[modulo] = [];
      grupos[modulo].push({ id: p.id, accion });
    });
    return grupos;
  }, [permisos]);

  // 🔹 Marcar o desmarcar permiso
  const togglePermiso = (id) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast.error('El nombre del rol es obligatorio.');
      return;
    }

    try {
      if (isNewMode) {
        // 🔹 Crear rol base
        const result = await RolService.create({ Nombre: nombre });
        toast.success('👤 Rol creado correctamente');

        // 🔹 Asignar permisos si hay seleccionados
        if (permisosSeleccionados.length > 0) {
          const nuevosPermisos = permisosSeleccionados.map((id) => ({
            permisoId: id,
          }));
          await RolService.updatePermisos(result.id, nuevosPermisos);
        }

        onUpdated?.(result);
      } else {
        // 🔹 Actualizar nombre
        await RolService.update(rol.id, { Id: rol.id, Nombre: nombre });

        // 🔹 Actualizar permisos
        const nuevosPermisos = permisosSeleccionados.map((id) => ({
          permisoId: id,
        }));
        await RolService.updatePermisos(rol.id, nuevosPermisos);

        toast.success('✏️ Rol actualizado correctamente');
        onUpdated?.({ ...rol, nombre });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el rol:', error);
      toast.error('❌ Error al guardar el rol.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[600px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nuevo Rol' : 'Editar Rol'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow">
            <div className="space-y-6">
              {/* Nombre del rol */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Nombre del Rol</Label>
                <Input
                  placeholder="Ej. Administrador"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              {/* Matriz de permisos */}
              <div className="space-y-5">
                {Object.entries(permisosAgrupados).map(([modulo, lista]) => (
                  <div
                    key={modulo}
                    className="border rounded-lg p-4 space-y-3 bg-muted/40"
                  >
                    <h3 className="font-medium text-sm text-foreground">
                      {modulo}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {lista.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={permisosSeleccionados.includes(perm.id)}
                            onCheckedChange={() => togglePermiso(perm.id)}
                          />
                          {perm.accion}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
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
