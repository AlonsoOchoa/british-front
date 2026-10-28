'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { EmpresaService } from '@/services/empresa.service';
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
import { EmpresaFormSheet } from '../components/empresa-form-sheet';
import { EmpresaListTable } from '../tables/empresa-list';

export function Empresa() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmpresas, setSelectedEmpresas] = useState([]); // ✅ ahora es array
  const [empresaCount, setEmpresaCount] = useState(0);
  const [updatedEmpresa, setUpdatedEmpresa] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedEmpresas || selectedEmpresas.length === 0) return;

    try {
      for (const empresa of selectedEmpresas) {
        await EmpresaService.delete(empresa.id);
      }

      toast.success(
        selectedEmpresas.length > 1
          ? `🗑️ ${selectedEmpresas.length} Empresas eliminadas correctamente`
          : '🗑️ Empresa eliminada correctamente',
      );

      setUpdatedEmpresa({
        ids: selectedEmpresas.map((a) => a.id),
        deleted: true,
      });

      setSelectedEmpresas([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar empresas:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Empresa</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {empresaCount} empresa.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>

          {tienePermiso('Empresa.Create') && (
            <Button
            variant="mono"
            className="gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Crear
          </Button>
          )}
          
          {tienePermiso('Empresa.Edit') && (
          <Button
            variant="outline"
            className="gap-2"
            disabled={!selectedEmpresas || selectedEmpresas.length !== 1}
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          )}
          {tienePermiso('Empresa.Delete') && (
          <Button
            variant="destructive"
            className="gap-2"
            disabled={!selectedEmpresas || selectedEmpresas.length === 0}
            onClick={() => setOpenDelete(true)}
          >
            <Trash className="h-4 w-4" />
            Eliminar
          </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <EmpresaListTable
        onCountChange={setEmpresaCount}
        onRowSelect={setSelectedEmpresas}
        updatedEmpresa={updatedEmpresa}
      />

      {/* MODAL CREAR */}
      <EmpresaFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedEmpresa}
      />

      {/* MODAL EDITAR */}
      <EmpresaFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        empresa={selectedEmpresas[0] || null}
        onUpdated={setUpdatedEmpresa}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedEmpresas.length > 1
                ? `¿Seguro que deseas eliminar ${selectedEmpresas.length} empresas seleccionados?`
                : `¿Seguro que deseas eliminar la empresa "${selectedEmpresas[0]?.nombreComercial}"?`}
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
