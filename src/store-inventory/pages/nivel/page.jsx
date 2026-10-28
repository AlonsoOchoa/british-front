'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { NivelService } from '@/services/nivel.service';
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
import { NivelFormSheet } from '../components/nivel-form-sheet';
import { NivelListTable } from '../tables/nivel-list';

export function Nivel() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedNiveles, setSelectedNiveles] = useState([]); // ✅ ahora es array
  const [nivelCount, setNivelCount] = useState(0);
  const [updatedNivel, setUpdatedNivel] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedNiveles || selectedNiveles.length === 0) return;

    try {
      for (const nivel of selectedNiveles) {
        await NivelService.delete(nivel.id);
      }

      toast.success(
        selectedNiveles.length > 1
          ? `🗑️ ${selectedNiveles.length} niveles eliminados correctamente`
          : '🗑️ Nivel eliminado correctamente',
      );

      setUpdatedNivel({
        ids: selectedNiveles.map((a) => a.id),
        deleted: true,
      });

      setSelectedNiveles([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar niveles:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Nivel</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {nivelCount} niveles.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          {/* 🔒 Solo se muestra si tiene permiso para crear */}
          {tienePermiso('Nivel.Create') && (
            <Button
              variant="mono"
              className="gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              Crear
            </Button>
          )}

          {tienePermiso('Nivel.Edit') && (
            <Button
              variant="outline"
              className="gap-2"
              disabled={!selectedNiveles || selectedNiveles.length !== 1}
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}

          {tienePermiso('Nivel.Delete') && (
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!selectedNiveles || selectedNiveles.length === 0}
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <NivelListTable
        onCountChange={setNivelCount}
        onRowSelect={setSelectedNiveles}
        updatedNivel={updatedNivel}
      />

      {/* MODAL CREAR */}
      <NivelFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedNivel}
      />

      {/* MODAL EDITAR */}
      <NivelFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        nivel={selectedNiveles[0] || null}
        onUpdated={setUpdatedNivel}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedNiveles.length > 1
                ? `¿Seguro que deseas eliminar ${selectedNiveles.length} niveles seleccionados?`
                : `¿Seguro que deseas eliminar el almacén "${selectedNiveles[0]?.nombre}"?`}
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
