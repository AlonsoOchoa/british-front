'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { EmpleadoService } from '@/services/empleado.service';
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
import { EmpleadoFormSheet } from '../components/empleado-form-sheet';
import { EmpleadoListTable } from '../tables/empleado-list';

export function Empleado() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmpleados, setSelectedEmpleados] = useState([]); // ✅ ahora es array
  const [empleadoCount, setEmpleadoCount] = useState(0);
  const [updatedEmpleado, setUpdatedEmpleado] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedEmpleados || selectedEmpleados.length === 0) return;

    try {
      for (const empleado of selectedEmpleados) {
        await EmpleadoService.delete(empleado.id);
      }

      toast.success(
        selectedEmpleados.length > 1
          ? `🗑️ ${selectedEmpleados.length} empleados eliminados correctamente`
          : '🗑️ Empleado eliminado correctamente',
      );

      setUpdatedEmpleado({
        ids: selectedEmpleados.map((a) => a.id),
        deleted: true,
      });

      setSelectedEmpleados([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Empleado</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {empleadoCount} empleados.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          {tienePermiso('Empleado.Create') && (
            <Button
            variant="mono"
            className="gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Crear
          </Button>
          )}
          
          {tienePermiso('Empleado.Edit') && (
          <Button
            variant="outline"
            className="gap-2"
            disabled={!selectedEmpleados || selectedEmpleados.length !== 1}
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          )}
          {tienePermiso('Empleado.Delete') && (
          <Button
            variant="destructive"
            className="gap-2"
            disabled={!selectedEmpleados || selectedEmpleados.length === 0}
            onClick={() => setOpenDelete(true)}
          >
            <Trash className="h-4 w-4" />
            Eliminar
          </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <EmpleadoListTable
        onCountChange={setEmpleadoCount}
        onRowSelect={setSelectedEmpleados}
        updatedEmpleado={updatedEmpleado}
      />

      {/* MODAL CREAR */}
      <EmpleadoFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedEmpleado}
      />

      {/* MODAL EDITAR */}
      <EmpleadoFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        empleado={selectedEmpleados[0] || null}
        onUpdated={setUpdatedEmpleado}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedEmpleados.length > 1
                ? `¿Seguro que deseas eliminar ${selectedEmpleados.length} empleados seleccionados?`
                : `¿Seguro que deseas eliminar el empleado "${selectedEmpleados[0]?.nombre}"?`}
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
