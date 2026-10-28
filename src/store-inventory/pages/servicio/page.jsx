'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { ServicioService } from '@/services/servicio.service';
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
import { ServicioFormSheet } from '../components/servicio-form-sheet';
import { ServicioListTable } from '../tables/servicio-list';

export function Servicio() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedServicios, setSelectedServicios] = useState([]); // ✅ array
  const [servicioCount, setServicioCount] = useState(0);
  const [updatedServicio, setUpdatedServicio] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();
  
  const handleDelete = async () => {
    if (!selectedServicios || selectedServicios.length === 0) return;

    try {
      for (const servicio of selectedServicios) {
        await ServicioService.delete(servicio.id);
      }

      toast.success(
        selectedServicios.length > 1
          ? `🗑️ ${selectedServicios.length} servicios eliminados correctamente`
          : '🗑️ Servicio eliminado correctamente',
      );

      setUpdatedServicio({
        ids: selectedServicios.map((a) => a.id),
        deleted: true,
      });

      setSelectedServicios([]);
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar servicios:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Servicios</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {servicioCount} servicios.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          {tienePermiso('Servicio.Create') && (
            <Button
              variant="mono"
              className="gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              Crear
            </Button>
          )}

          {tienePermiso('Servicio.Edit') && (
            <Button
              variant="outline"
              className="gap-2"
              disabled={!selectedServicios || selectedServicios.length !== 1}
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}

          {tienePermiso('Servicio.Delete') && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!selectedServicios || selectedServicios.length === 0}
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <ServicioListTable
        onCountChange={setServicioCount}
        onRowSelect={setSelectedServicios}
        updatedServicio={updatedServicio}
      />

      {/* MODAL CREAR */}
      <ServicioFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedServicio}
      />

      {/* MODAL EDITAR */}
      <ServicioFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        servicio={selectedServicios[0] || null}
        onUpdated={setUpdatedServicio}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedServicios.length > 1
                ? `¿Seguro que deseas eliminar ${selectedServicios.length} servicios seleccionados?`
                : `¿Seguro que deseas eliminar el servicio "${selectedServicios[0]?.nombre}"?`}
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
