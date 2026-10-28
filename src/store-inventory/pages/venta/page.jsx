'use client';

import { useState } from 'react';
import { Pencil, PlusIcon, Search, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { usePermisos } from '@/hooks/use-permisos';
import { VentaService } from '@/services/venta.service';
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
import { VentaFormSheet } from '../components/venta-form-sheet';
import { VentaListTable } from '../tables/venta-list';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function Venta() {
  const hoy = new Date();
  const fechaHace15Dias = new Date();
  fechaHace15Dias.setDate(hoy.getDate() - 15);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedVentas, setSelectedVentas] = useState([]); // ✅ ahora es array
  const [ventaCount, setVentaCount] = useState(0);
  const [updatedVenta, setUpdatedVenta] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [filtro, setFiltro] = useState('');

const [fechaInicio, setFechaInicio] = useState(formatDate(fechaHace15Dias));
  const [fechaFin, setFechaFin] = useState(formatDate(hoy));

  const [filtrosAplicados, setFiltrosAplicados] = useState({
    fechaInicio: formatDate(fechaHace15Dias),
    fechaFin: formatDate(hoy),
  });

  const { tienePermiso } = usePermisos();

  const handleDelete = async () => {
    if (!selectedVentas || selectedVentas.length === 0) return;

    try {
      for (const venta of selectedVentas) {
        await VentaService.delete(venta.id);
      }

      toast.success(
        selectedVentas.length > 1
          ? `🗑️ ${selectedVentas.length} ventas eliminadas correctamente`
          : '🗑️ Venta eliminada correctamente',
      );

      setUpdatedVenta({
        ids: selectedVentas.map((a) => a.id),
        deleted: true,
      });

      setSelectedVentas([]); // ✅ Limpia selección
      setOpenDelete(false);
    } catch (error) {
      console.error('Error al eliminar ventas:', error);
      toast.error('❌ Error al eliminar.');
    }
  };

  const handleExportar = async () => {
  try {
    await VentaService.exportarVentas({
      ...filtrosAplicados,
      busqueda: filtro,
    });

    toast.success('Excel descargado correctamente');
  } catch (error) {
    console.error('Error al exportar ventas:', error);
    toast.error('No se pudo exportar la información');
  }
};

  const handleBuscar = () => {
  if (!fechaInicio || !fechaFin) {
    toast.error('Selecciona la fecha inicial y final');
    return;
  }

  if (fechaInicio > fechaFin) {
    toast.error('La fecha inicial no puede ser mayor que la final');
    return;
  }

  setFiltrosAplicados({
      fechaInicio,
      fechaFin,
    });
  };



  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* HEADER */}
      <div className="flex items-center flex-wrap gap-2.5 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Ventas</h1>
          <span className="text-sm text-muted-foreground">
            Se encontraron {ventaCount} ventas.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleExportar}>
            <Upload className="h-4 w-4" />
            Exportar
          </Button>

          {tienePermiso('Venta.View') && (

            <Button
            variant="outline"
            className="gap-2"
            onClick={handleBuscar}
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>
          )}
          

          {tienePermiso('Venta.Create') && (
            <Button
            variant="mono"
            className="gap-2"
            onClick={() => setIsCreateOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Crear
          </Button>
          )}
          
          {tienePermiso('Venta.Edit') && (
          <Button
            variant="outline"
            className="gap-2"
            disabled={!selectedVentas || selectedVentas.length !== 1}
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          )}
          {tienePermiso('Venta.Delete') && (
          <Button
            variant="destructive"
            className="gap-2"
            disabled={!selectedVentas || selectedVentas.length === 0}
            onClick={() => setOpenDelete(true)}
          >
            <Trash className="h-4 w-4" />
            Eliminar
          </Button>
          )}
        </div>
      </div>

      {/* LISTADO */}
      <VentaListTable
        onCountChange={setVentaCount}
        onRowSelect={setSelectedVentas}
        updatedVenta={updatedVenta}
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
        filtrosAplicados={filtrosAplicados}
      />

      {/* MODAL CREAR */}
      <VentaFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onUpdated={setUpdatedVenta}
      />

      {/* MODAL EDITAR */}
      <VentaFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        venta={selectedVentas[0] || null}
        onUpdated={setUpdatedVenta}
      />

      {/* ALERT DIALOG ELIMINAR */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedVentas.length > 1
                ? `¿Seguro que deseas eliminar ${selectedVentas.length} ventas seleccionados?`
                : `¿Seguro que deseas eliminar el venta "${selectedVentas[0]?.id}"?`}
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
