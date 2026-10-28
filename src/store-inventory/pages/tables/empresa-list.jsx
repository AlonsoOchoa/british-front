'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { EllipsisVertical, Filter, Info, Layers, Search, Settings, Star, Trash, X } from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { EmpresaService } from '@/services/empresa.service';
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

export function EmpresaListTable({ onCountChange, onRowSelect, updatedEmpresa }) {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await EmpresaService.getAll();
        setData(response);
        onCountChange?.(response.length);
      } catch (error) {
        console.error(error);
        toast.error('Error al obtener las empresas');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
  if (!updatedEmpresa) return;

  setData((prev) => {
    // 🧹 Eliminación múltiple
    if (updatedEmpresa.deleted) {
      if (updatedEmpresa.ids && Array.isArray(updatedEmpresa.ids)) {
        return prev.filter((i) => !updatedEmpresa.ids.includes(i.id));
      } else if (updatedEmpresa.id) {
        return prev.filter((i) => i.id !== updatedEmpresa.id);
      }
    }

    // ✍️ Actualización normal (1 solo registro editado)
    if (updatedEmpresa.id) {
      const exists = prev.some((x) => x.id === updatedEmpresa.id);
      return exists
        ? prev.map((i) => (i.id === updatedEmpresa.id ? { ...i, ...updatedEmpresa } : i))
        : [updatedEmpresa, ...prev];
    }

    return prev;
  });

  setRowSelection({});
  onRowSelect?.([]);
}, [updatedEmpresa]);


  useEffect(() => {
    onCountChange?.(data.length);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lower = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.id?.toString().includes(lower) ||
        item.razonSocial?.toLowerCase().includes(lower) ||
        item.ruc?.toLowerCase().includes(lower) ||
        item.direccion?.toLowerCase().includes(lower) ||
        item.telefono?.toLowerCase().includes(lower) ||
        item.correo?.toLowerCase().includes(lower) ||
        item.estado?.toLowerCase().includes(lower)
    );
  }, [data, searchQuery]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'check',
        accessorFn: (row) => row.id,
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        size: 40,
      },
      {
        id: 'id',
        accessorKey: 'id',
        header: ({ column }) => <DataGridColumnHeader title="Id" column={column} />,
        cell: ({ row }) => <span>{row.original.id}</span>,
        enableSorting: true,
        size: 60,
      },
      {
        id: 'ruc',
        accessorKey: 'ruc',
        header: ({ column }) => <DataGridColumnHeader title="RUC" column={column} />,
        cell: ({ row }) => <span>{row.original.ruc}</span>,
        enableSorting: true,
        size: 100,
      },
      {
        id: 'razonSocial',
        accessorKey: 'razonSocial',
        header: ({ column }) => <DataGridColumnHeader title="Razón Social" column={column} />,
        cell: ({ row }) => <span>{row.original.razonSocial}</span>,
        enableSorting: true,
        size: 250,
      },
      {
        id: 'nombreComercial',
        accessorKey: 'nombreComercial',
        header: ({ column }) => <DataGridColumnHeader title="Nombre Comercial" column={column} />,
        cell: ({ row }) => <span>{row.original.nombreComercial}</span>,
        enableSorting: true,
        size: 250,
      },
      {
        id: 'direccion',
        accessorKey: 'direccion',
        header: ({ column }) => <DataGridColumnHeader title="Dirección" column={column} />,
        cell: ({ row }) => <span>{row.original.direccion}</span>,
        enableSorting: true,
        size: 250,
      },
      {
        id: 'telefono',
        accessorKey: 'telefono',
        header: ({ column }) => <DataGridColumnHeader title="Teléfono" column={column} />,
        cell: ({ row }) => <span>{row.original.telefono}</span>,
        enableSorting: true,
        size: 250,
      },
      {
        id: 'correo',
        accessorKey: 'correo',
        header: ({ column }) => <DataGridColumnHeader title="Correo" column={column} />,
        cell: ({ row }) => <span>{row.original.correo}</span>,
        enableSorting: true,
        size: 250,
      },
    ],
    []
  );

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
            Seleccionaste la empresa con ID: {selectedRows.map((r) => r.id).join(', ')}
          </AlertTitle>
        </Alert>
      ));
      onRowSelect?.(selectedRows);
    } else {
      onRowSelect?.([]);
    }
  }, [rowSelection]);

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

  return (
    <Card>
      <CardHeader className="py-3 flex-nowrap">
        <CardToolbar className="flex items-center justify-between gap-2 w-full">
          <div className="w-full max-w-[200px]">
            <InputWrapper>
              <Search />
              <Input
                placeholder="Buscar..."
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
