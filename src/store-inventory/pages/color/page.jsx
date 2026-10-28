'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { ColorService } from '@/services/color.service';
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
import { ColorFormSheet } from '../components/color-form-sheet';
import { ColorListTable } from '../tables/color-list';

export function Color() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedColores, setSelectedColores] = useState([]); // ✅ array
  const [colorCount, setColorCount] = useState(0);
  const [updatedColor, setUpdatedColor] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedColores || selectedColores.length === 0) return;

    try {
      for (const color of selectedColores) {
        await ColorService.delete(color.id);
      }

      toast.success(
        selectedColores.length > 1
          ? `🗑️ ${selectedColores.length} colores eliminados correctamente`
          : '🗑️ Color eliminado correctamente',
      );

      setUpdatedColor({
        ids: selectedColores.map((a) => a.id),
        deleted: true,
      });

      setSelectedColores([]);
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar colores:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Color</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {colorCount} colores.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          {tienePermiso('Color.Create') && (
            <Button
              variant="mono"
              className="gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              Crear
            </Button>
          )}

          {tienePermiso('Color.Edit') && (
            <Button
              variant="outline"
              className="gap-2"
              disabled={!selectedColores || selectedColores.length !== 1}
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}

          {tienePermiso('Color.Delete') && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!selectedColores || selectedColores.length === 0}
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <ColorListTable
        onCountChange={setColorCount}
        onRowSelect={setSelectedColores}
        updatedColor={updatedColor}
      />

      {/* MODAL CREAR */}
      <ColorFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedColor}
      />

      {/* MODAL EDITAR */}
      <ColorFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        color={selectedColores[0] || null}
        onUpdated={setUpdatedColor}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedColores.length > 1
                ? `¿Seguro que deseas eliminar ${selectedColores.length} colores seleccionados?`
                : `¿Seguro que deseas eliminar el color "${selectedColores[0]?.nombre}"?`}
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
