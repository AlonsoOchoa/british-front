'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { EllipsisVertical, Filter, Info, Layers, Search, Settings, Star, Trash, X } from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { EmpleadoService } from '@/services/empleado.service';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTable, CardToolbar } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridColumnVisibility } from '@/components/ui/data-grid-column-visibility';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable, DataGridTableRowSelect, DataGridTableRowSelectAll } from '@/components/ui/data-grid-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input, InputWrapper } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ManageVariantsSheet } from '../components/manage-variants';

export function EmpleadoListTable({ onCountChange, onRowSelect, updatedEmpleado }) {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);


  const fmtDateTime = (v) => (v ? new Date(v).toLocaleString() : '-');

  // 📥 Obtener empleados al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await EmpleadoService.getAll();
        setData(response);
        onCountChange?.(response.length);
      } catch (error) {
        console.error(error);
        toast.error('Error al obtener los empleados');
      }
    };
    fetchData();
  }, []);

  // 🔁 Actualizar en tiempo real cuando se crea, edita o elimina
  useEffect(() => {
    if (!updatedEmpleado) return;

    setData((prev) => {
      // 🧹 Eliminación múltiple
      if (updatedEmpleado.deleted) {
        if (updatedEmpleado.ids && Array.isArray(updatedEmpleado.ids)) {
          return prev.filter((i) => !updatedEmpleado.ids.includes(i.id));
        } else if (updatedEmpleado.id) {
          return prev.filter((i) => i.id !== updatedEmpleado.id);
        }
      }

      // ✍️ Actualización / inserción
      if (updatedEmpleado.id) {
        const exists = prev.some((x) => x.id === updatedEmpleado.id);
        return exists
          ? prev.map((i) => (i.id === updatedEmpleado.id ? { ...i, ...updatedEmpleado } : i))
          : [updatedEmpleado, ...prev];
      }

      return prev;
    });

    setRowSelection({});
    onRowSelect?.([]);
  }, [updatedEmpleado]);

  // 📊 Contador de registros
  useEffect(() => {
    onCountChange?.(data.length);
  }, [data]);

  // 🔎 Filtro por búsqueda (cubre campos clave y nombres relacionados si vienen anidados)
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();

    const safeText = (x) => (x ?? '').toString().toLowerCase();

    return data.filter((item) => {
      const relNombre = [
        item?.empresa?.nombreComercial,
        item?.sucursal?.nombre,
        item?.area?.nombre,
        item?.puesto?.nombre,
        item?.usuario?.nombreUsuario,
        item?.supervisor?.nombres,
        item?.supervisor?.apellidos,
        item?.tipoIdentidad?.nombre,
      ]
        .filter(Boolean)
        .map((x) => x.toLowerCase())
        .join(' ');

      return (
        safeText(item.id).includes(q) ||
        safeText(item.numeroDocumento).includes(q) ||
        safeText(item.nombres).includes(q) ||
        safeText(item.apellidos).includes(q) ||
        safeText(item.telefono).includes(q) ||
        safeText(item.correo).includes(q) ||
        safeText(item.direccion).includes(q) ||
        safeText(item.estado).includes(q) ||
        relNombre.includes(q)
      );
    });
  }, [data, searchQuery]);

  // 🧱 Columnas (TODAS las de tu entidad)
  const columns = useMemo(
    () => [
      // selección
      {
        accessorKey: 'check',
        accessorFn: (row) => row.id,
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        size: 50,
      },
      // identificadores & datos base
      {
        id: 'id',
        accessorKey: 'id',
        header: ({ column }) => <DataGridColumnHeader title="ID" column={column} />,
        cell: ({ row }) => <span>{row.original.id}</span>,
        enableSorting: true,
        size: 70,
      },
      {
        id: 'tipoIdentidad',
        accessorKey: 'tipoIdentidadId',
        header: ({ column }) => <DataGridColumnHeader title="Documento" column={column} />,
        cell: ({ row }) => <span>{row.original?.tipoIdentidad?.nombre || row.original.tipoIdentidadId || '-'}</span>,
        enableSorting: true,
        size: 160,
      },
      {
        id: 'numeroDocumento',
        accessorKey: 'numeroDocumento',
        header: ({ column }) => <DataGridColumnHeader title="Número" column={column} />,
        cell: ({ row }) => <span>{row.original.numeroDocumento}</span>,
        enableSorting: true,
        size: 220,
      },
      {
        id: 'empleado',
        accessorKey: 'nombres',
        header: ({ column }) => <DataGridColumnHeader title="Empleado" column={column} />,
        cell: ({ row }) => {
            const nombres = row.original?.nombres ?? '';
            const apellidos = row.original?.apellidos ?? '';
            const nombreCompleto = `${nombres} ${apellidos}`.trim();

        return <span>{nombreCompleto || '-'}</span>;
        },
        enableSorting: true,
        size: 260,
      },
      {
        id: 'celular',
        accessorKey: 'celular',
        header: ({ column }) => <DataGridColumnHeader title="Celular" column={column} />,
        cell: ({ row }) => <span>{row.original.celular || '-'}</span>,
        enableSorting: true,
        size: 170,
      },
      {
        id: 'direccion',
        accessorKey: 'direccion',
        header: ({ column }) => <DataGridColumnHeader title="Dirección" column={column} />,
        cell: ({ row }) => <span>{row.original.direccion || '-'}</span>,
        enableSorting: true,
        size: 140,
      },
      // relaciones (muestra nombre si viene anidado; si no, el Id)
      {
        id: 'empresa',
        accessorKey: 'empresaId',
        header: ({ column }) => <DataGridColumnHeader title="Empresa" column={column} />,
        cell: ({ row }) => <span>{row.original?.empresa?.nombreComercial || row.original.empresaId || '-'}</span>,
        enableSorting: true,
        size: 160,
      },
      {
        id: 'sucursal',
        accessorKey: 'sucursalId',
        header: ({ column }) => <DataGridColumnHeader title="Sucursal" column={column} />,
        cell: ({ row }) => <span>{row.original?.sucursal?.nombre || row.original.sucursalId || '-'}</span>,
        enableSorting: true,
        size: 170,
      },
      {
        id: 'area',
        accessorKey: 'areaId',
        header: ({ column }) => <DataGridColumnHeader title="Área" column={column} />,
        cell: ({ row }) => <span>{row.original?.area?.nombre || row.original.areaId || '-'}</span>,
        enableSorting: true,
        size: 140,
      },
      {
        id: 'puesto',
        accessorKey: 'puestoId',
        header: ({ column }) => <DataGridColumnHeader title="Puesto" column={column} />,
        cell: ({ row }) => <span>{row.original?.puesto?.nombre || row.original.puestoId || '-'}</span>,
        enableSorting: true,
        size: 140,
      },
      {
        id: 'supervisor',
        accessorKey: 'supervisorId',
        header: ({ column }) => <DataGridColumnHeader title="Supervisor" column={column} />,
        cell: ({ row }) => {
    const supervisor = row.original?.supervisor;
    return (
      <span>
        {supervisor
          ? `${supervisor.nombres} ${supervisor.apellidos ?? ''}`.trim()
          : row.original.supervisorId || '-'}
      </span>
    );
  },
        enableSorting: true,
        size: 170,
      },
      {
        id: 'usuario',
        accessorKey: 'usuarioId',
        header: ({ column }) => <DataGridColumnHeader title="Usuario Asignado" column={column} />,
        cell: ({ row }) => <span>{row.original?.usuario?.nombreUsuario || row.original.usuarioId || '-'}</span>,
        enableSorting: true,
        size: 170,
      },
      {
        id: 'userNew',
        accessorKey: 'userNew',
        header: ({ column }) => <DataGridColumnHeader title="Usuario Creación" column={column} />,
        cell: ({ row }) => <span>{row.original.userNew || '-'}</span>,
        enableSorting: true,
        size: 170,
      },
      {
        id: 'dateNew',
        accessorKey: 'dateNew',
        header: ({ column }) => <DataGridColumnHeader title="Fecha Creación" column={column} />,
        cell: ({ row }) => <span>{fmtDateTime(row.original.dateNew)}</span>,
        enableSorting: true,
        size: 190,
      },
      {
        id: 'userEdit',
        accessorKey: 'userEdit',
        header: ({ column }) => <DataGridColumnHeader title="Usuario Edición" column={column} />,
        cell: ({ row }) => <span>{row.original.userEdit || '-'}</span>,
        enableSorting: true,
        size: 170,
      },
      {
        id: 'dateEdit',
        accessorKey: 'dateEdit',
        header: ({ column }) => <DataGridColumnHeader title="Fecha Edición" column={column} />,
        cell: ({ row }) => <span>{fmtDateTime(row.original.dateEdit)}</span>,
        enableSorting: true,
        size: 190,
      },
    ],
    []
  );

  // 🧲 Manejo de selección
  useEffect(() => {
    const selectedRows = Object.keys(rowSelection)
      .map((key) => table.getRowModel().rowsById[key]?.original)
      .filter(Boolean);

    if (selectedRows.length > 0) {
      toast.custom((t) => (
        <Alert variant="mono" icon="success" close onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>
            Seleccionaste {selectedRows.length} empleado(s): {selectedRows.map((r) => r.id).join(', ')}
          </AlertTitle>
        </Alert>
      ));
      onRowSelect?.(selectedRows);
    } else {
      onRowSelect?.([]);
    }
  }, [rowSelection]);

  // 🧮 Configuración de la tabla
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { pagination, sorting, rowSelection },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // 📜 Render
  return (
    <Card>
      <CardHeader className="py-3 flex-nowrap">
        <CardToolbar className="flex items-center justify-between gap-2 w-full">
          <div className="w-full max-w-[200px]">
            <InputWrapper>
              <Search />
              <Input
                placeholder="Buscar empleado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                ref={inputRef}
              />
              {searchQuery && (
                <Button
                  variant="dim"
                  size="sm"
                  className="-me-3.5"
                  onClick={() => setSearchQuery('')}
                >
                  <X />
                </Button>
              )}
            </InputWrapper>
          </div>
          <DataGridColumnVisibility
            table={table}
            trigger={
              <Button variant="outline">
                <Filter className="size-3.5" />
                Columnas
              </Button>
            }
          />
        </CardToolbar>
      </CardHeader>
      <DataGrid
        table={table}
        recordCount={filteredData.length}
        tableLayout={{
          columnsPinnable: true,
          columnsMovable: true,
          columnsVisibility: true,
          cellBorder: true,
        }}
      >
        <CardTable>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardTable>
        <CardFooter>
          <DataGridPagination />
        </CardFooter>
      </DataGrid>
    </Card>
  );
}
