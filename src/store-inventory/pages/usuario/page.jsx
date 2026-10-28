'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { UsuarioService } from '@/services/usuario.service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { UsuarioFormSheet } from '../components/usuario-form-sheet';
import { UsuarioListTable } from '../tables/usuario-list';

export function Usuario() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUsuarios, setSelectedUsuarios] = useState([]); // ✅ ahora es array
  const [usuarioCount, setUsuarioCount] = useState(0);
  const [updatedUsuario, setUpdatedUsuario] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedUsuarios || selectedUsuarios.length === 0) return;

    try {
      for (const usuario of selectedUsuarios) {
        await UsuarioService.delete(usuario.id);
      }

      toast.success(
        selectedUsuarios.length > 1
          ? `🗑️ ${selectedUsuarios.length} usuarios eliminados correctamente`
          : '🗑️ Usuario eliminado correctamente',
      );

      setUpdatedUsuario({
        ids: selectedUsuarios.map((a) => a.id),
        deleted: true,
      });

      setSelectedUsuarios([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar usuarios:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Usuario</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {usuarioCount} usuarios.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          {/* 🔒 Solo se muestra si tiene permiso para crear */}
          {tienePermiso('Usuario.Create') && (
            <Button
              variant="mono"
              className="gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              Crear
            </Button>
          )}

          {tienePermiso('Usuario.Edit') && (
            <Button
              variant="outline"
              className="gap-2"
              disabled={!selectedUsuarios || selectedUsuarios.length !== 1}
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}

          {tienePermiso('Usuario.Delete') && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!selectedUsuarios || selectedUsuarios.length === 0}
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <UsuarioListTable
        onCountChange={setUsuarioCount}
        onRowSelect={setSelectedUsuarios}
        updatedUsuario={updatedUsuario}
      />

      {/* MODAL CREAR */}
      <UsuarioFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedUsuario}
      />

      {/* MODAL EDITAR */}
      <UsuarioFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        usuario={selectedUsuarios[0] || null}
        onUpdated={setUpdatedUsuario}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUsuarios.length > 1
                ? `¿Seguro que deseas eliminar ${selectedUsuarios.length} usuarios seleccionados?`
                : `¿Seguro que deseas eliminar el usuario "${selectedUsuarios[0]?.nombreUsuario}"?`}
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
