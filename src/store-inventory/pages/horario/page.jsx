'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { HorarioService } from '@/services/horario.service';
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
import { HorarioFormSheet } from '../components/horario-form-sheet';
import { HorarioListTable } from '../tables/horario-list';

export function Horario() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedHorarios, setSelectedHorarios] = useState([]); // ✅ ahora es array
  const [horarioCount, setHorarioCount] = useState(0);
  const [updatedHorario, setUpdatedHorario] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedHorarios || selectedHorarios.length === 0) return;

    try {
      for (const horario of selectedHorarios) {
        await HorarioService.delete(horario.id);
      }

      toast.success(
        selectedHorarios.length > 1
          ? `🗑️ ${selectedHorarios.length} horarios eliminados correctamente`
          : '🗑️ horario eliminado correctamente',
      );

      setUpdatedHorario({
        ids: selectedHorarios.map((a) => a.id),
        deleted: true,
      });

      setSelectedHorarios([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar horario:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Horario</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {horarioCount} horarios.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          {tienePermiso('Horario.Create') && (
            <Button
            variant="mono"
            className="gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Crear
          </Button>
          )}
          
          {tienePermiso('Horario.Edit') && (
          <Button
            variant="outline"
            className="gap-2"
            disabled={!selectedHorarios || selectedHorarios.length !== 1}
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          )}
          {tienePermiso('Horario.Delete') && (
          <Button
            variant="destructive"
            className="gap-2"
            disabled={!selectedHorarios || selectedHorarios.length === 0}
            onClick={() => setOpenDelete(true)}
          >
            <Trash className="h-4 w-4" />
            Eliminar
          </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <HorarioListTable
        onCountChange={setHorarioCount}
        onRowSelect={setSelectedHorarios}
        updatedHorario={updatedHorario}
      />

      {/* MODAL CREAR */}
      <HorarioFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedHorario}
      />

      {/* MODAL EDITAR */}
      <HorarioFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        horario={selectedHorarios[0] || null}
        onUpdated={setUpdatedHorario}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedHorarios.length > 1
                ? `¿Seguro que deseas eliminar ${selectedHorarios.length} horarios seleccionados?`
                : `¿Seguro que deseas eliminar el horario "${selectedHorarios[0]?.nombre}"?`}
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
