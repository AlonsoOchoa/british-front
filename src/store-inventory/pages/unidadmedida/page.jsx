'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { UnidadMedidaService } from '@/services/unidadmedida.service';
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
import { UnidadMedidaFormSheet } from '../components/unidadmedida-form-sheet';
import { UnidadMedidaListTable } from '../tables/unidadmedida-list';

export function UnidadMedida() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUnidadMedidas, setSelectedUnidadMedidas] = useState([]); // ✅ ahora es array
  const [unidadMedidaCount, setUnidadMedidaCount] = useState(0);
  const [updatedUnidadMedida, setUpdatedUnidadMedida] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedUnidadMedidas || selectedUnidadMedidas.length === 0) return;

    try {
      for (const unidadmedida of selectedUnidadMedidas) {
        await UnidadMedidaService.delete(unidadmedida.id);
      }

      toast.success(
        selectedUnidadMedidas.length > 1
          ? `🗑️ ${selectedUnidadMedidas.length} unidades de medida eliminadas correctamente`
          : '🗑️ Unidad de medida eliminada correctamente',
      );

      setUpdatedUnidadMedida({
        ids: selectedUnidadMedidas.map((a) => a.id),
        deleted: true,
      });

      setSelectedUnidadMedidas([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar unidad de medida:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Unidades de Medida</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {unidadMedidaCount} unidades de medida.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          {tienePermiso('UnidadMedida.Create') && (
          <Button
            variant="mono"
            className="gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Crear
          </Button>
          )}
          {tienePermiso('UnidadMedida.Edit') && (
          <Button
            variant="outline"
            className="gap-2"
            disabled={!selectedUnidadMedidas || selectedUnidadMedidas.length !== 1}
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          )}
          {tienePermiso('UnidadMedida.Delete') && (
          <Button
            variant="destructive"
            className="gap-2"
            disabled={!selectedUnidadMedidas || selectedUnidadMedidas.length === 0}
            onClick={() => setOpenDelete(true)}
          >
            <Trash className="h-4 w-4" />
            Eliminar
          </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <UnidadMedidaListTable
        onCountChange={setUnidadMedidaCount}
        onRowSelect={setSelectedUnidadMedidas}
        updatedUnidadMedida={updatedUnidadMedida}
      />

      {/* MODAL CREAR */}
      <UnidadMedidaFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedUnidadMedida}
      />

      {/* MODAL EDITAR */}
      <UnidadMedidaFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        unidadmedida={selectedUnidadMedidas[0] || null}
        onUpdated={setUpdatedUnidadMedida}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUnidadMedidas.length > 1
                ? `¿Seguro que deseas eliminar ${selectedUnidadMedidas.length} las unidades de medida seleccionadas?`
                : `¿Seguro que deseas eliminar la unidad de medida "${selectedUnidadMedidas[0]?.nombre}"?`}
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
