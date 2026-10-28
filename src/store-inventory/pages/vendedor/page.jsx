'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { VendedorService } from '@/services/vendedor.service';
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
import { VendedorFormSheet } from '../components/vendedor-form-sheet';
import { VendedorListTable } from '../tables/vendedor-list';

export function Vendedor() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedVendedores, setSelectedVendedores] = useState([]); // ✅ ahora es array
  const [vendedorCount, setVendedorCount] = useState(0);
  const [updatedVendedor, setUpdatedVendedor] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedVendedores || selectedVendedores.length === 0) return;

    try {
      for (const vendedor of selectedVendedores) {
        await VendedorService.delete(vendedor.id);
      }

      toast.success(
        selectedVendedores.length > 1
          ? `🗑️ ${selectedVendedores.length} empleados eliminados correctamente`
          : '🗑️ Empleado eliminado correctamente',
      );

      setUpdatedEmpleado({
        ids: selectedVendedores.map((a) => a.id),
        deleted: true,
      });

      setSelectedVendedores([]); // ✅ Limpia selección
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
          <h1 className="text-xl font-bold text-foreground">Vendedor</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {vendedorCount} vendedores.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          {tienePermiso('Vendedor.Create') && (
            <Button
            variant="mono"
            className="gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Crear
          </Button>
          )}
          
          {tienePermiso('Vendedor.Edit') && (
          <Button
            variant="outline"
            className="gap-2"
            disabled={!selectedVendedores || selectedVendedores.length !== 1}
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          )}
          {tienePermiso('Vendedor.Delete') && (
          <Button
            variant="destructive"
            className="gap-2"
            disabled={!selectedVendedores || selectedVendedores.length === 0}
            onClick={() => setOpenDelete(true)}
          >
            <Trash className="h-4 w-4" />
            Eliminar
          </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <VendedorListTable
        onCountChange={setVendedorCount}
        onRowSelect={setSelectedVendedores}
        updatedVendedor={updatedVendedor}
      />

      {/* MODAL CREAR */}
      <VendedorFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedVendedor}
      />

      {/* MODAL EDITAR */}
      <VendedorFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        vendedor={selectedVendedores[0] || null}
        onUpdated={setUpdatedVendedor}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedVendedores.length > 1
                ? `¿Seguro que deseas eliminar ${selectedVendedores.length} vendedores seleccionados?`
                : `¿Seguro que deseas eliminar el vendedor "${selectedVendedores[0]?.nombre}"?`}
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
