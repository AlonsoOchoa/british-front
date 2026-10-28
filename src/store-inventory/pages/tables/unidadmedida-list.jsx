'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { EllipsisVertical, Filter, Info, Layers, Search, Settings, Star, Trash, X } from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { UnidadMedidaService } from '@/services/unidadmedida.service';
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

export function UnidadMedidaListTable({ onCountChange, onRowSelect, updatedUnidadMedida }) {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await UnidadMedidaService.getAll();
        setData(response);
        onCountChange?.(response.length);
      } catch (error) {
        console.error(error);
        toast.error('Error al obtener las unidades de medida');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
  if (!updatedUnidadMedida) return;

  setData((prev) => {
    // 🧹 Eliminación múltiple
    if (updatedUnidadMedida.deleted) {
      if (updatedUnidadMedida.ids && Array.isArray(updatedUnidadMedida.ids)) {
        return prev.filter((i) => !updatedUnidadMedida.ids.includes(i.id));
      } else if (updatedUnidadMedida.id) {
        return prev.filter((i) => i.id !== updatedUnidadMedida.id);
      }
    }

    // ✍️ Actualización normal (1 solo registro editado)
    if (updatedUnidadMedida.id) {
      const exists = prev.some((x) => x.id === updatedUnidadMedida.id);
      return exists
        ? prev.map((i) => (i.id === updatedUnidadMedida.id ? { ...i, ...updatedUnidadMedida } : i))
        : [updatedUnidadMedida, ...prev];
    }

    return prev;
  });

  setRowSelection({});
  onRowSelect?.([]);
}, [updatedUnidadMedida]);


  useEffect(() => {
    onCountChange?.(data.length);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lower = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.id?.toString().includes(lower) ||
        item.nombre?.toLowerCase().includes(lower) ||
        item.abreviatura?.toLowerCase().includes(lower) ||
        item.simbolo?.toLowerCase().includes(lower) ||
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
        size: 40,
      },
      {
        id: 'nombre',
        accessorKey: 'nombre',
        header: ({ column }) => <DataGridColumnHeader title="Nombre" column={column} />,
        cell: ({ row }) => <span>{row.original.nombre}</span>,
        enableSorting: true,
        size: 250,
      },
      {
        id: 'abreviatura',
        accessorKey: 'abreviatura',
        header: ({ column }) => <DataGridColumnHeader title="Abreviatura" column={column} />,
        cell: ({ row }) => <span>{row.original.abreviatura}</span>,
        enableSorting: true,
        size: 100,
      },
      {
        id: 'simbolo',
        accessorKey: 'simbolo',
        header: ({ column }) => <DataGridColumnHeader title="Simbolo" column={column} />,
        cell: ({ row }) => <span>{row.original.simbolo}</span>,
        enableSorting: true,
        size: 100,
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
            Seleccionaste la unidad de medida con ID: {selectedRows.map((r) => r.id).join(', ')}
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
