'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { RolService } from '@/services/rol.service';
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
import { RolFormSheet } from '../components/rol-form-sheet';
import { RolListTable } from '../tables/rol-list';

export function Rol() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]); // ✅ ahora es array
  const [rolCount, setRolCount] = useState(0);
  const [updatedRol, setUpdatedRol] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedRoles || selectedRoles.length === 0) return;

    try {
      for (const rol of selectedRoles) {
        await RolService.delete(rol.id);
      }

      toast.success(
        selectedRoles.length > 1
          ? `🗑️ ${selectedRoles.length} roles eliminados correctamente`
          : '🗑️ Rol eliminado correctamente',
      );

      setUpdatedRol({
        ids: selectedRoles.map((a) => a.id),
        deleted: true,
      });

      setSelectedRoles([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar roles:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Rol</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {rolCount} roles.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          {/* 🔒 Solo se muestra si tiene permiso para crear */}
          {tienePermiso('Rol.Create') && (
            <Button
              variant="mono"
              className="gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              Crear
            </Button>
          )}

          {tienePermiso('Rol.Edit') && (
            <Button
              variant="outline"
              className="gap-2"
              disabled={!selectedRoles || selectedRoles.length !== 1}
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}

          {tienePermiso('Rol.Delete') && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!selectedRoles || selectedRoles.length === 0}
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <RolListTable
        onCountChange={setRolCount}
        onRowSelect={setSelectedRoles}
        updatedRol={updatedRol}
      />

      {/* MODAL CREAR */}
      <RolFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedRol}
      />

      {/* MODAL EDITAR */}
      <RolFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        rol={selectedRoles[0] || null}
        onUpdated={setUpdatedRol}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRoles.length > 1
                ? `¿Seguro que deseas eliminar ${selectedRoles.length} roles seleccionados?`
                : `¿Seguro que deseas eliminar el almacén "${selectedRoles[0]?.nombre}"?`}
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
