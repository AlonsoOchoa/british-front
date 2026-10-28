'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { EllipsisVertical, Filter, Info, Layers, Search, Settings, Star, Trash, X } from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { SubOrigenService } from '@/services/suborigen.service';
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

export function SubOrigenListTable({ onCountChange, onRowSelect, updatedSubOrigen }) {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);

  // 📥 Obtener Origen al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await SubOrigenService.getAll();
        setData(response);
        onCountChange?.(response.length);
      } catch (error) {
        console.error(error);
        toast.error('Error al obtener los suborigenes');
      }
    };
    fetchData();
  }, []);

  // 🔁 Actualizar en tiempo real cuando se crea, edita o elimina
  useEffect(() => {
    if (!updatedSubOrigen) return;

    setData((prev) => {
      // 🧹 Eliminación múltiple
      if (updatedSubOrigen.deleted) {
        if (updatedSubOrigen.ids && Array.isArray(updatedSubOrigen.ids)) {
          return prev.filter((i) => !updatedSubOrigen.ids.includes(i.id));
        } else if (updatedSubOrigen.id) {
          return prev.filter((i) => i.id !== updatedSubOrigen.id);
        }
      }

      // ✍️ Actualización / inserción
      if (updatedSubOrigen.id) {
        const exists = prev.some((x) => x.id === updatedSubOrigen.id);
        return exists
          ? prev.map((i) => (i.id === updatedSubOrigen.id ? { ...i, ...updatedSubOrigen } : i))
          : [updatedSubOrigen, ...prev];
      }

      return prev;
    });

    setRowSelection({});
    onRowSelect?.([]);
  }, [updatedSubOrigen]);

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
        item?.sucursal?.nombre,
        item?.origen?.nombre,
      ]
        .filter(Boolean)
        .map((x) => x.toLowerCase())
        .join(' ');

      return (
        safeText(item.id).includes(q) ||
        safeText(item.nombre).includes(q) ||
        safeText(item.multiplicador).includes(q) ||
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
        id: 'sucursal',
        accessorKey: 'sucursalId',
        header: ({ column }) => <DataGridColumnHeader title="Sucursal" column={column} />,
        cell: ({ row }) => <span>{row.original?.sucursal?.nombre || row.original.sucursalId || '-'}</span>,
        enableSorting: true,
        size: 120,
      },
      {
        id: 'origen',
        accessorKey: 'origenId',
        header: ({ column }) => <DataGridColumnHeader title="Origen" column={column} />,
        cell: ({ row }) => <span>{row.original?.origen?.nombre || row.original.origenId || '-'}</span>,
        enableSorting: true,
        size: 120,
      },
      {
        id: 'nombre',
        accessorKey: 'nombre',
        header: ({ column }) => <DataGridColumnHeader title="Nombre" column={column} />,
        cell: ({ row }) => <span>{row.original.nombre}</span>,
        enableSorting: true,
        size: 120,
      },
      {
        id: 'multiplicador',
        accessorKey: 'multiplicador',
        header: ({ column }) => <DataGridColumnHeader title="Multiplicador" column={column} />,
        cell: ({ row }) => <span>{row.original.multiplicador}</span>,
        enableSorting: true,
        size: 90,
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
            Seleccionaste {selectedRows.length} suborigen(es): {selectedRows.map((r) => r.id).join(', ')}
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
        <CardToolbar className="flex items-center justify-between gap-2 w-full">
          <div className="w-full max-w-[200px]">
            <InputWrapper>
              <Search />
              <Input
                placeholder="Buscar suborigen..."
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
