'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { AlmacenService } from '@/services/almacen.service';
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
import { AlmacenFormSheet } from '../components/almacen-form-sheet';
import { AlmacenListTable } from '../tables/almacen-list';

export function Almacen() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAlmacenes, setSelectedAlmacenes] = useState([]); // ✅ ahora es array
  const [almacenCount, setAlmacenCount] = useState(0);
  const [updatedAlmacen, setUpdatedAlmacen] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedAlmacenes || selectedAlmacenes.length === 0) return;

    try {
      for (const almacen of selectedAlmacenes) {
        await AlmacenService.delete(almacen.id);
      }

      toast.success(
        selectedAlmacenes.length > 1
          ? `🗑️ ${selectedAlmacenes.length} almacenes eliminados correctamente`
          : '🗑️ Almacén eliminado correctamente',
      );

      setUpdatedAlmacen({
        ids: selectedAlmacenes.map((a) => a.id),
        deleted: true,
      });

      setSelectedAlmacenes([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar almacenes:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Almacén</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {almacenCount} almacenes.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          {/* 🔒 Solo se muestra si tiene permiso para crear */}
          {tienePermiso('Almacen.Create') && (
            <Button
              variant="mono"
              className="gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              Crear
            </Button>
          )}

          {tienePermiso('Almacen.Edit') && (
            <Button
              variant="outline"
              className="gap-2"
              disabled={!selectedAlmacenes || selectedAlmacenes.length !== 1}
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}

          {tienePermiso('Almacen.Delete') && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!selectedAlmacenes || selectedAlmacenes.length === 0}
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <AlmacenListTable
        onCountChange={setAlmacenCount}
        onRowSelect={setSelectedAlmacenes}
        updatedAlmacen={updatedAlmacen}
      />

      {/* MODAL CREAR */}
      <AlmacenFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedAlmacen}
      />

      {/* MODAL EDITAR */}
      <AlmacenFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        almacen={selectedAlmacenes[0] || null}
        onUpdated={setUpdatedAlmacen}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAlmacenes.length > 1
                ? `¿Seguro que deseas eliminar ${selectedAlmacenes.length} almacenes seleccionados?`
                : `¿Seguro que deseas eliminar el almacén "${selectedAlmacenes[0]?.nombre}"?`}
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
