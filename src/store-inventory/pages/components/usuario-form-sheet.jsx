'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
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
import { RolService } from '@/services/rol.service';
import { UsuarioService } from '@/services/usuario.service';

export function UsuarioFormSheet({
  mode,
  open,
  onOpenChange,
  usuario,
  onUpdated,
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [claveHash, setClaveHash] = useState('');
  const [correo, setCorreo] = useState('');
  const [rolId, setRolId] = useState('');
  const [roles, setRoles] = useState([]);

  // Estado auxiliar para mostrar campo vacío visualmente
  const [showedPassword, setShowedPassword] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rl] = await Promise.all([RolService.getAll()]);
        setRoles(rl);
      } catch (error) {
        console.error('Error cargando roles:', error);
        toast.error('⚠️ Error cargando roles.');
      }
    };

    if (open) fetchData();
  }, [open]);

  useEffect(() => {
    if (isEditMode && usuario) {
      setNombreUsuario(usuario.nombreUsuario || '');
      setCorreo(usuario.correo || '');
      setRolId(String(usuario.rolId));
      setClaveHash(usuario.claveHash || ''); // mantener valor original internamente
      setShowedPassword(''); // campo visible vacío
    }

    if (isNewMode && open) {
      setNombreUsuario('');
      setClaveHash('');
      setCorreo('');
      setRolId('');
      setShowedPassword('');
    }
  }, [usuario, isEditMode, isNewMode, open]);

  const handleSave = async () => {
    if (!nombreUsuario.trim()) {
      toast.error('El nombre del usuario es obligatorio.');
      return;
    }

    if (!rolId.trim()) {
      toast.error('El rol del usuario es obligatorio.');
      return;
    }

    try {
      if (isNewMode) {
        // 🚨 Solo en creación es obligatorio el campo contraseña
        if (!claveHash.trim()) {
          toast.error('La contraseña del usuario es obligatoria.');
          return;
        }

        const result = await UsuarioService.create({
          NombreUsuario: nombreUsuario,
          ClaveHash: claveHash,
          Correo: correo,
          RolId: Number(rolId),
        });

        toast.success('👤 Usuario creado correctamente');
        onUpdated?.(result);
      } else {
        // ✏️ En edición, si no se cambia, se mantiene el hash actual
        const result = await UsuarioService.update(usuario.id, {
          Id: usuario.id,
          NombreUsuario: nombreUsuario,
          ClaveHash: claveHash, // si no se modificó, mantiene el valor original
          Correo: correo,
          RolId: Number(rolId),
        });

        toast.success('✏️ Usuario actualizado correctamente');
        onUpdated?.(result);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
      toast.error('❌ Error al guardar el usuario.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Nuevo Usuario' : 'Editar Usuario'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow">
            <div className="space-y-6">
              {/* Usuario */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Usuario</Label>
                <Input
                  placeholder="Usuario"
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Contraseña</Label>
                <Input
                  placeholder="Contraseña"
                  type="password"
                  value={showedPassword}
                  onChange={(e) => {
                    setShowedPassword(e.target.value);
                    setClaveHash(e.target.value);
                  }}
                />
              </div>

              {/* Correo */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Correo</Label>
                <Input
                  placeholder="Correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              {/* Rol */}
              <div>
                <Label className="text-xs">Rol</Label>
                <Select
                  value={rolId}
                  onValueChange={setRolId}
                  indicatorPosition="right"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
