'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { ProductoService } from '@/services/producto.service';
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
import { ProductoFormSheet } from '../components/producto-form-sheet';
import { ProductoListTable } from '../tables/producto-list';

export function Producto() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProductos, setSelectedProductos] = useState([]); // ✅ ahora es array
  const [productoCount, setProductoCount] = useState(0);
  const [updatedProducto, setUpdatedProducto] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedProductos || selectedProductos.length === 0) return;

    try {
      for (const producto of selectedProductos) {
        await ProductoService.delete(producto.id);
      }

      toast.success(
        selectedProductos.length > 1
          ? `🗑️ ${selectedProductos.length} productos eliminados correctamente`
          : '🗑️ Producto eliminado correctamente',
      );

      setUpdatedProducto({
        ids: selectedProductos.map((a) => a.id),
        deleted: true,
      });

      setSelectedProductos([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar productos:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Producto</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {productoCount} productos.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          {tienePermiso('Producto.Create') && (
            <Button
            variant="mono"
            className="gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Crear
          </Button>
          )}
          
          {tienePermiso('Producto.Edit') && (
          <Button
            variant="outline"
            className="gap-2"
            disabled={!selectedProductos || selectedProductos.length !== 1}
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          )}
          {tienePermiso('Producto.Delete') && (
          <Button
            variant="destructive"
            className="gap-2"
            disabled={!selectedProductos || selectedProductos.length === 0}
            onClick={() => setOpenDelete(true)}
          >
            <Trash className="h-4 w-4" />
            Eliminar
          </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <ProductoListTable
        onCountChange={setProductoCount}
        onRowSelect={setSelectedProductos}
        updatedProducto={updatedProducto}
      />

      {/* MODAL CREAR */}
      <ProductoFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedProducto}
      />

      {/* MODAL EDITAR */}
      <ProductoFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        producto={selectedProductos[0] || null}
        onUpdated={setUpdatedProducto}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProductos.length > 1
                ? `¿Seguro que deseas eliminar ${selectedProductos.length} productos seleccionados?`
                : `¿Seguro que deseas eliminar el producto "${selectedProductos[0]?.nombre}"?`}
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
