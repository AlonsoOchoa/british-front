'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { AfectacionService } from '@/services/afectacion.service';
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
import { AfectacionFormSheet } from '../components/afectacion-form-sheet';
import { AfectacionListTable } from '../tables/afectacion-list';

export function Afectacion() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAfectaciones, setSelectedAfectaciones] = useState([]); // ✅ ahora es array
  const [afectacionCount, setAfectacionCount] = useState(0);
  const [updatedAfectacion, setUpdatedAfectacion] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedAfectaciones || selectedAfectaciones.length === 0) return;

    try {
      for (const afectacion of selectedAfectaciones) {
        await AfectacionService.delete(afectacion.id);
      }

      toast.success(
        selectedAfectaciones.length > 1
          ? `🗑️ ${selectedAfectaciones.length} afectaciones eliminadas correctamente`
          : '🗑️ Afectacion eliminada correctamente',
      );

      setUpdatedAfectacion({
        ids: selectedAfectaciones.map((a) => a.id),
        deleted: true,
      });

      setSelectedAfectaciones([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar afectación:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Afectación</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {afectacionCount} afectaciones.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          {tienePermiso('Afectacion.Create') && (
            <Button
              variant="mono"
              className="gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              Crear
            </Button>
          )}

          {tienePermiso('Afectacion.Edit') && (
            <Button
              variant="outline"
              className="gap-2"
              disabled={
                !selectedAfectaciones || selectedAfectaciones.length !== 1
              }
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}

          {tienePermiso('Afectacion.Delete') && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={
                !selectedAfectaciones || selectedAfectaciones.length === 0
              }
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <AfectacionListTable
        onCountChange={setAfectacionCount}
        onRowSelect={setSelectedAfectaciones}
        updatedAfectacion={updatedAfectacion}
      />

      {/* MODAL CREAR */}
      <AfectacionFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedAfectacion}
      />

      {/* MODAL EDITAR */}
      <AfectacionFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        afectacion={selectedAfectaciones[0] || null}
        onUpdated={setUpdatedAfectacion}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAfectaciones.length > 1
                ? `¿Seguro que deseas eliminar ${selectedAfectaciones.length} las afectaciones seleccionadas?`
                : `¿Seguro que deseas eliminar la afectacion "${selectedAfectaciones[0]?.nombre}"?`}
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
