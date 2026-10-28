'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { TipoIdentidadService } from '@/services/tipoidentidad.service';
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
import { TipoIdentidadFormSheet } from '../components/tipoidentidad-form-sheet';
import { TipoIdentidadListTable } from '../tables/tipoidentidad-list';

export function TipoIdentidad() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTipoIdentidades, setSelectedTipoIdentidades] = useState([]); // ✅ array
  const [tipoidentidadCount, setTipoIdentidadCount] = useState(0);
  const [updatedTipoIdentidad, setUpdatedTipoIdentidad] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedTipoIdentidades || selectedTipoIdentidades.length === 0) return;

    try {
      for (const tipoidentidad of selectedTipoIdentidades) {
        await TipoIdentidadService.delete(tipoidentidad.id);
      }

      toast.success(
        selectedTipoIdentidades.length > 1
          ? `🗑️ ${selectedTipoIdentidades.length} tipos de idenditdad eliminados correctamente`
          : '🗑️ Tipo de idenditdad eliminados correctamente',
      );

      setUpdatedTipoIdentidad({
        ids: selectedTipoIdentidades.map((a) => a.id),
        deleted: true,
      });

      setSelectedTipoIdentidades([]);
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar tipos de identidades:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Tipos de Identidad</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {tipoidentidadCount} tipos de identidad.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          {tienePermiso('TipoIdentidad.Create') && (
            <Button
            variant="mono"
            className="gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Crear
          </Button>
          )}
          
          {tienePermiso('TipoIdentidad.Edit') && (
          <Button
            variant="outline"
            className="gap-2"
            disabled={!selectedTipoIdentidades || selectedTipoIdentidades.length !== 1}
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          )}
          {tienePermiso('TipoIdentidad.Delete') && (
          <Button
            variant="destructive"
            className="gap-2"
            disabled={!selectedTipoIdentidades || selectedTipoIdentidades.length === 0}
            onClick={() => setOpenDelete(true)}
          >
            <Trash className="h-4 w-4" />
            Eliminar
          </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <TipoIdentidadListTable
        onCountChange={setTipoIdentidadCount}
        onRowSelect={setSelectedTipoIdentidades}
        updatedTipoIdentidad={updatedTipoIdentidad}
      />

      {/* MODAL CREAR */}
      <TipoIdentidadFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedTipoIdentidad}
      />

      {/* MODAL EDITAR */}
      <TipoIdentidadFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        tipoidentidad={selectedTipoIdentidades[0] || null}
        onUpdated={setUpdatedTipoIdentidad}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTipoIdentidades.length > 1
                ? `¿Seguro que deseas eliminar ${selectedTipoIdentidades.length} tipos de identidades seleccionados?`
                : `¿Seguro que deseas eliminar el tipo de identidad "${selectedTipoIdentidades[0]?.nombre}"?`}
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
