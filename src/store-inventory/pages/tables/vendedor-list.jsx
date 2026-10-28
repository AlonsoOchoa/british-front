'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { EllipsisVertical, Filter, Info, Layers, Search, Settings, Star, Trash, X } from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { VendedorService } from '@/services/vendedor.service';
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


export function VendedorListTable({ onCountChange, onRowSelect, updatedVendedor }) {
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
        const response = await VendedorService.getAll();
        setData(response);
        onCountChange?.(response.length);
      } catch (error) {
        console.error(error);
        toast.error('Error al obtener los vendedores');
      }
    };
    fetchData();
  }, []);

  // 🔁 Actualizar en tiempo real cuando se crea, edita o elimina
  useEffect(() => {
    if (!updatedVendedor) return;

    setData((prev) => {
      // 🧹 Eliminación múltiple
      if (updatedVendedor.deleted) {
        if (updatedVendedor.ids && Array.isArray(updatedVendedor.ids)) {
          return prev.filter((i) => !updatedVendedor.ids.includes(i.id));
        } else if (updatedVendedor.id) {
          return prev.filter((i) => i.id !== updatedVendedor.id);
        }
      }

      // ✍️ Actualización / inserción
      if (updatedVendedor.id) {
        const exists = prev.some((x) => x.id === updatedVendedor.id);
        return exists
          ? prev.map((i) => (i.id === updatedVendedor.id ? { ...i, ...updatedVendedor } : i))
          : [updatedVendedor, ...prev];
      }

      return prev;
    });

    setRowSelection({});
    onRowSelect?.([]);
  }, [updatedVendedor]);

  // 📊 Contador de registros
  useEffect(() => {
    onCountChange?.(data.length);
  }, [data]);

  const tabs = [
    { id: 'all', label: 'Todos' },
    { id: 'activo', label: 'Activos' },
    { id: 'inactivo', label: 'Inactivos' },
  ];

  const [activeTab, setActiveTab] = useState('all');

  // 🔎 Filtro por búsqueda (cubre campos clave y nombres relacionados si vienen anidados)
  const filteredData = useMemo(() => {
    let result = [...data];

    // 🔹 Filtro por tabs / estado
    if (activeTab === 'all') {
    result = result.filter((item) => item.estado !== 'X');
    } else if (activeTab === 'activo') {
      result = result.filter((item) => item.estado === '0');
    } else if (activeTab === 'inactivo') {
      result = result.filter((item) => item.estado === '1');
    }

    // 🔎 Filtro por búsqueda
    if (!searchQuery) return result;

    const q = searchQuery.toLowerCase();
    const safeText = (x) => (x ?? '').toString().toLowerCase();

    return result.filter((item) => {
      const relNombre = [item?.empleado?.nombres, item?.empleado?.apellidos]
        .filter(Boolean)
        .map((x) => x.toLowerCase())
        .join(' ');

      return (
        safeText(item.id).includes(q) ||
        safeText(item.codigo).includes(q) ||
        safeText(item.comision).includes(q) ||
        safeText(item.metaMensual).includes(q) ||
        safeText(item.estado).includes(q) ||
        relNombre.includes(q)
      );
    });
  }, [data, activeTab, searchQuery]);

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
        header: ({ column }) => (
          <DataGridColumnHeader title="ID" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.id}</span>,
        enableSorting: true,
        size: 70,
      },
      {
        id: 'empleado',
        accessorKey: 'empleadoId',
        header: ({ column }) => (
          <DataGridColumnHeader title="Empleado" column={column} />
        ),
        cell: ({ row }) => {
          const empleado = row.original?.empleado;
          return (
            <span>
              {empleado
                ? `${empleado.nombres} ${empleado.apellidos ?? ''}`.trim()
                : row.original.empleadoId || '-'}
            </span>
          );
        },
        enableSorting: true,
        size: 170,
      },
      {
        id: 'codigo',
        accessorKey: 'codigo',
        header: ({ column }) => (
          <DataGridColumnHeader title="Codigo" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.codigo}</span>,
        enableSorting: true,
        size: 120,
      },
      {
        id: 'comision',
        accessorKey: 'comision',
        header: ({ column }) => (
          <DataGridColumnHeader title="Comision" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.comision || '-'}</span>,
        enableSorting: true,
        size: 120,
      },
      {
        id: 'metaMensual',
        accessorKey: 'metaMensual',
        header: ({ column }) => (
          <DataGridColumnHeader title="Meta mensual" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.metaMensual || '-'}</span>,
        enableSorting: true,
        size: 120,
      },
      {
        id: 'estado',
        accessorKey: 'estado',
        header: ({ column }) => (
          <DataGridColumnHeader title="Estado" column={column} />
        ),
        cell: ({ row }) => {
          const estado = row.original.estado;

          const estadosMap = {
            '0': { label: 'Activo', variant: 'success' },
            '1': { label: 'Inactivo', variant: 'warning' },
          };

          const current = estadosMap[estado];

          return current ? (
            <Badge
              variant={current.variant}
              appearance="light"
              className="rounded-full"
            >
              {current.label}
            </Badge>
          ) : (
            <span>-</span>
          );
        },
        enableSorting: true,
        size: 100,
      },
      {
        id: 'userNew',
        accessorKey: 'userNew',
        header: ({ column }) => (
          <DataGridColumnHeader title="Usuario Creación" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.userNew || '-'}</span>,
        enableSorting: true,
        size: 150,
      },
      {
        id: 'dateNew',
        accessorKey: 'dateNew',
        header: ({ column }) => (
          <DataGridColumnHeader title="Fecha Creación" column={column} />
        ),
        cell: ({ row }) => <span>{fmtDateTime(row.original.dateNew)}</span>,
        enableSorting: true,
        size: 150,
      },
      {
        id: 'userEdit',
        accessorKey: 'userEdit',
        header: ({ column }) => (
          <DataGridColumnHeader title="Usuario Edición" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.userEdit || '-'}</span>,
        enableSorting: true,
        size: 150,
      },
      {
        id: 'dateEdit',
        accessorKey: 'dateEdit',
        header: ({ column }) => (
          <DataGridColumnHeader title="Fecha Edición" column={column} />
        ),
        cell: ({ row }) => <span>{fmtDateTime(row.original.dateEdit)}</span>,
        enableSorting: true,
        size: 150,
      },
    ],
    [],
  );

  // 🧲 Manejo de selección
  useEffect(() => {
    const selectedRows = Object.keys(rowSelection)
      .map((key) => table.getRowModel().rowsById[key]?.original)
      .filter(Boolean);

    if (selectedRows.length > 0) {
      toast.custom((t) => (
        <Alert variant="mono" icon="info" close onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>
            Seleccionaste {selectedRows.length} empleado(s): {selectedRows.map((r) => r.id).join(', ')}
          </AlertTitle>
        </Alert>
      ),
      {
        position: 'bottom-left',
      });
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent p-0 mb-2">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <CardToolbar className="flex items-center gap-2">
          <div className="w-full max-w-[200px]">
            <InputWrapper>
              <Search />
              <Input
                placeholder="Buscar vendedor..."
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