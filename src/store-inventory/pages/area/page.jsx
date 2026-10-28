'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { AreaService } from '@/services/area.service';
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
import { AreaFormSheet } from '../components/area-form-sheet';
import { AreaListTable } from '../tables/area-list';

export function Area() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState([]); // ✅ ahora es array
  const [areaCount, setAreaCount] = useState(0);
  const [updatedArea, setUpdatedArea] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedAreas || selectedAreas.length === 0) return;

    try {
      for (const area of selectedAreas) {
        await AreaService.delete(area.id);
      }

      toast.success(
        selectedAreas.length > 1
          ? `🗑️ ${selectedAreas.length} áreas eliminadas correctamente`
          : '🗑️ área eliminada correctamente',
      );

      setUpdatedArea({
        ids: selectedAreas.map((a) => a.id),
        deleted: true,
      });

      setSelectedAreas([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar las áreas:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Área</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {areaCount} áreas.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          {/* 🔒 Solo se muestra si tiene permiso para crear */}
          {tienePermiso('Area.Create') && (
            <Button
              variant="mono"
              className="gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              Crear
            </Button>
          )}

          {tienePermiso('Area.Edit') && (
            <Button
              variant="outline"
              className="gap-2"
              disabled={!selectedAreas || selectedAreas.length !== 1}
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}

          {tienePermiso('Area.Delete') && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!selectedAreas || selectedAreas.length === 0}
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <AreaListTable
        onCountChange={setAreaCount}
        onRowSelect={setSelectedAreas}
        updatedArea={updatedArea}
      />

      {/* MODAL CREAR */}
      <AreaFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedArea}
      />

      {/* MODAL EDITAR */}
      <AreaFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        area={selectedAreas[0] || null}
        onUpdated={setUpdatedArea}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAreas.length > 1
                ? `¿Seguro que deseas eliminar ${selectedAreas.length} áreas seleccionados?`
                : `¿Seguro que deseas eliminar el área "${selectedAreas[0]?.nombre}"?`}
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
