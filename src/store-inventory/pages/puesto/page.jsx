'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { PuestoService } from '@/services/puesto.service';
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
import { PuestoFormSheet } from '../components/puesto-form-sheet';
import { PuestoListTable } from '../tables/puesto-list';

export function Puesto() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPuestos, setSelectedPuestos] = useState([]); // ✅ ahora es array
  const [puestoCount, setPuestoCount] = useState(0);
  const [updatedPuesto, setUpdatedPuesto] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedPuestos || selectedPuestos.length === 0) return;

    try {
      for (const puesto of selectedPuestos) {
        await PuestoService.delete(puesto.id);
      }

      toast.success(
        selectedPuestos.length > 1
          ? `🗑️ ${selectedPuestos.length} puestos eliminados correctamente`
          : '🗑️ puesto eliminado correctamente',
      );

      setUpdatedPuesto({
        ids: selectedPuestos.map((a) => a.id),
        deleted: true,
      });

      setSelectedPuestos([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar puestos:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Puesto</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {puestoCount} puestos.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          {/* 🔒 Solo se muestra si tiene permiso para crear */}
          {tienePermiso('Puesto.Create') && (
            <Button
              variant="mono"
              className="gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              Crear
            </Button>
          )}

          {tienePermiso('Puesto.Edit') && (
            <Button
              variant="outline"
              className="gap-2"
              disabled={!selectedPuestos || selectedPuestos.length !== 1}
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}

          {tienePermiso('Puesto.Delete') && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!selectedPuestos || selectedPuestos.length === 0}
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <PuestoListTable
        onCountChange={setPuestoCount}
        onRowSelect={setSelectedPuestos}
        updatedPuesto={updatedPuesto}
      />

      {/* MODAL CREAR */}
      <PuestoFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedPuesto}
      />

      {/* MODAL EDITAR */}
      <PuestoFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        puesto={selectedPuestos[0] || null}
        onUpdated={setUpdatedPuesto}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPuestos.length > 1
                ? `¿Seguro que deseas eliminar ${selectedPuestos.length} puestos seleccionados?`
                : `¿Seguro que deseas eliminar el puesto "${selectedPuestos[0]?.nombre}"?`}
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
