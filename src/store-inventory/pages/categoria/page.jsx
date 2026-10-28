'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { CategoriaService } from '@/services/categoria.service';
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
import { CategoriaFormSheet } from '../components/categoria-form-sheet';
import { CategoriaListTable } from '../tables/categoria-list';

export function Categoria() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategorias, setSelectedCategorias] = useState([]); // ✅ ahora es array
  const [categoriaCount, setCategoriaCount] = useState(0);
  const [updatedCategoria, setUpdatedCategoria] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedCategorias || selectedCategorias.length === 0) return;

    try {
      for (const categoria of selectedCategorias) {
        await CategoriaService.delete(categoria.id);
      }

      toast.success(
        selectedCategorias.length > 1
          ? `🗑️ ${selectedCategorias.length} categorias eliminadas correctamente`
          : '🗑️ Categoria eliminada correctamente',
      );

      setUpdatedCategoria({
        ids: selectedCategorias.map((a) => a.id),
        deleted: true,
      });

      setSelectedCategorias([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar categorias:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Categoría</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {categoriaCount} categorias.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          {tienePermiso('Categoria.Create') && (
            <Button
              variant="mono"
              className="gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              Crear
            </Button>
          )}
          {tienePermiso('Categoria.Edit') && (
            <Button
              variant="outline"
              className="gap-2"
              disabled={!selectedCategorias || selectedCategorias.length !== 1}
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}
          {tienePermiso('Categoria.Delete') && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!selectedCategorias || selectedCategorias.length === 0}
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <CategoriaListTable
        onCountChange={setCategoriaCount}
        onRowSelect={setSelectedCategorias}
        updatedCategoria={updatedCategoria}
      />

      {/* MODAL CREAR */}
      <CategoriaFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedCategoria}
      />

      {/* MODAL EDITAR */}
      <CategoriaFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        categoria={selectedCategorias[0] || null}
        onUpdated={setUpdatedCategoria}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCategorias.length > 1
                ? `¿Seguro que deseas eliminar ${selectedCategorias.length} las categorias seleccionadas?`
                : `¿Seguro que deseas eliminar la categoria "${selectedCategorias[0]?.nombre}"?`}
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
