'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  EllipsisVertical,
  Filter,
  Info,
  Layers,
  Search,
  Settings,
  Star,
  Trash,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { UsuarioService } from '@/services/usuario.service';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
  CardToolbar,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridColumnVisibility } from '@/components/ui/data-grid-column-visibility';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input, InputWrapper } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ManageVariantsSheet } from '../components/manage-variants';

export function UsuarioListTable({
  onCountChange,
  onRowSelect,
  updatedUsuario,
}) {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await UsuarioService.getAll();
        setData(response);
        onCountChange?.(response.length);
      } catch (error) {
        console.error(error);
        toast.error('Error al obtener los almacenes');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!updatedUsuario) return;

    setData((prev) => {
      // 🧹 Eliminación múltiple
      if (updatedUsuario.deleted) {
        if (updatedUsuario.ids && Array.isArray(updatedUsuario.ids)) {
          return prev.filter((i) => !updatedUsuario.ids.includes(i.id));
        } else if (updatedUsuario.id) {
          return prev.filter((i) => i.id !== updatedUsuario.id);
        }
      }

      // ✍️ Actualización normal (1 solo registro editado)
      if (updatedUsuario.id) {
        const exists = prev.some((x) => x.id === updatedUsuario.id);
        return exists
          ? prev.map((i) => (i.id === updatedUsuario.id ? { ...i, ...updatedUsuario } : i))
          : [updatedUsuario, ...prev];
      }

      return prev;
    });

    setRowSelection({});
    onRowSelect?.([]);
  }, [updatedUsuario]);

  useEffect(() => {
    onCountChange?.(data.length);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();

    const safeText = (x) => (x ?? '').toString().toLowerCase();

    return data.filter((item) => {
      const rolNombre = item?.rol?.nombre?.toLowerCase() || '';

      return (
        safeText(item.id).includes(q) ||
        safeText(item.nombreUsuario).includes(q) ||
        safeText(item.correo).includes(q) ||
        safeText(item.estado).includes(q) ||
        rolNombre.includes(q)
      );
    });
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
        header: ({ column }) => (
          <DataGridColumnHeader title="Id" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.id}</span>,
        enableSorting: true,
        size: 40,
      },
      {
        id: 'nombreUsuario',
        accessorKey: 'nombreUsuario',
        header: ({ column }) => (
          <DataGridColumnHeader title="Nombre" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.nombreUsuario}</span>,
        enableSorting: true,
        size: 250,
      },
      {
        id: 'correo',
        accessorKey: 'correo',
        header: ({ column }) => (
          <DataGridColumnHeader title="Correo" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.correo}</span>,
        enableSorting: true,
        size: 250,
      },
      {
        id: 'rol',
        accessorKey: 'rolId',
        header: ({ column }) => <DataGridColumnHeader title="Rol" column={column} />,
        cell: ({ row }) => <span>{row.original?.rol?.nombre || row.original.rolId || '-'}</span>,
        enableSorting: true,
        size: 250,
      },
    ],
    [],
  );

  useEffect(() => {
    const selectedRows = Object.keys(rowSelection)
      .map((key) => table.getRowModel().rowsById[key]?.original)
      .filter(Boolean);

    if (selectedRows.length > 0) {
      toast.custom((t) => (
        <Alert
          variant="mono"
          icon="success"
          close
          onClose={() => toast.dismiss(t)}
        >
          <AlertIcon>
            <Info />
          </AlertIcon>
          <AlertTitle>
            Seleccionaste el usuario con ID:{' '}
            {selectedRows.map((r) => r.id).join(', ')}
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
