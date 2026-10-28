'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { TipoProductoService } from '@/services/tipoproducto.service';
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
import { TipoProductoFormSheet } from '../components/tipoproducto-form-sheet';
import { TipoProductoListTable } from '../tables/tipoproducto-list';

export function TipoProducto() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTipoProductos, setSelectedTipoProductos] = useState([]); // ✅ array
  const [tipoproductoCount, setTipoProductoCount] = useState(0);
  const [updatedTipoProducto, setUpdatedTipoProducto] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedTipoProductos || selectedTipoProductos.length === 0) return;

    try {
      for (const tipoproducto of selectedTipoProductos) {
        await TipoProductoService.delete(tipoproducto.id);
      }

      toast.success(
        selectedTipoProductos.length > 1
          ? `🗑️ ${selectedTipoProductos.length} tipos de producto eliminados correctamente`
          : '🗑️ Tipo de producto eliminado correctamente',
      );

      setUpdatedTipoProducto({
        ids: selectedTipoProductos.map((a) => a.id),
        deleted: true,
      });

      setSelectedTipoProductos([]);
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar tipos de producto:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Tipos de Producto</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {tipoproductoCount} tipos de producto.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          {tienePermiso('TipoProducto.Create') && (
            <Button
            variant="mono"
            className="gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Crear
          </Button>
          )}
          
          {tienePermiso('TipoProducto.Edit') && (
          <Button
            variant="outline"
            className="gap-2"
            disabled={!selectedTipoProductos || selectedTipoProductos.length !== 1}
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          )}
          {tienePermiso('TipoProducto.Delete') && (
          <Button
            variant="destructive"
            className="gap-2"
            disabled={!selectedTipoProductos || selectedTipoProductos.length === 0}
            onClick={() => setOpenDelete(true)}
          >
            <Trash className="h-4 w-4" />
            Eliminar
          </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <TipoProductoListTable
        onCountChange={setTipoProductoCount}
        onRowSelect={setSelectedTipoProductos}
        updatedTipoProducto={updatedTipoProducto}
      />

      {/* MODAL CREAR */}
      <TipoProductoFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedTipoProducto}
      />

      {/* MODAL EDITAR */}
      <TipoProductoFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        tipoproducto={selectedTipoProductos[0] || null}
        onUpdated={setUpdatedTipoProducto}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTipoProductos.length > 1
                ? `¿Seguro que deseas eliminar ${selectedTipoProductos.length} tipos de producto seleccionados?`
                : `¿Seguro que deseas eliminar el tipo de producto "${selectedTipoProductos[0]?.nombre}"?`}
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
