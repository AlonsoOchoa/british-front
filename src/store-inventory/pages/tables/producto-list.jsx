'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { EllipsisVertical, Filter, Info, Layers, Search, Settings, Star, Trash, X } from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { ProductoService } from '@/services/producto.service';
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

export function ProductoListTable({ onCountChange, onRowSelect, updatedProducto }) {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);

  // utils locales
  const fmtMoney = (v) =>
    typeof v === 'number' && !isNaN(v)
      ? `S/ ${v.toFixed(2)}`
      : v && !isNaN(parseFloat(v))
      ? `S/ ${parseFloat(v).toFixed(2)}`
      : 'S/ 0.00';

  const BoolPill = ({ value }) => (
    <span
      className={cn(
        'px-2 py-0.5 rounded text-xs font-medium',
        value ? 'bg-green-100 text-green-700' : 'bg-muted text-foreground/70'
      )}
    >
      {value ? 'Sí' : 'No'}
    </span>
  );

  const fmtDateTime = (v) => (v ? new Date(v).toLocaleString() : '-');

  // 📥 Obtener productos al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ProductoService.getAll();
        setData(response);
        onCountChange?.(response.length);
      } catch (error) {
        console.error(error);
        toast.error('Error al obtener los productos');
      }
    };
    fetchData();
  }, []);

  // 🔁 Actualizar en tiempo real cuando se crea, edita o elimina
  useEffect(() => {
    if (!updatedProducto) return;

    setData((prev) => {
      // 🧹 Eliminación múltiple
      if (updatedProducto.deleted) {
        if (updatedProducto.ids && Array.isArray(updatedProducto.ids)) {
          return prev.filter((i) => !updatedProducto.ids.includes(i.id));
        } else if (updatedProducto.id) {
          return prev.filter((i) => i.id !== updatedProducto.id);
        }
      }

      // ✍️ Actualización / inserción
      if (updatedProducto.id) {
        const exists = prev.some((x) => x.id === updatedProducto.id);
        return exists
          ? prev.map((i) => (i.id === updatedProducto.id ? { ...i, ...updatedProducto } : i))
          : [updatedProducto, ...prev];
      }

      return prev;
    });

    setRowSelection({});
    onRowSelect?.([]);
  }, [updatedProducto]);

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
        item?.almacen?.nombre,
        item?.categoria?.nombre,
        item?.tipoProducto?.nombre,
        item?.unidadMedida?.nombre,
        item?.color?.nombre,
        item?.afectacion?.nombre,
      ]
        .filter(Boolean)
        .map((x) => x.toLowerCase())
        .join(' ');

      return (
        safeText(item.id).includes(q) ||
        safeText(item.nombre).includes(q) ||
        safeText(item.descripcion).includes(q) ||
        safeText(item.codigo).includes(q) ||
        safeText(item.codigoBarras).includes(q) ||
        safeText(item.marca).includes(q) ||
        safeText(item.modelo).includes(q) ||
        safeText(item.ubicacion).includes(q) ||
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
        id: 'nombre',
        accessorKey: 'nombre',
        header: ({ column }) => <DataGridColumnHeader title="Nombre" column={column} />,
        cell: ({ row }) => <span>{row.original.nombre}</span>,
        enableSorting: true,
        size: 220,
      },
      {
        id: 'descripcion',
        accessorKey: 'descripcion',
        header: ({ column }) => <DataGridColumnHeader title="Descripción" column={column} />,
        cell: ({ row }) => <span className="line-clamp-2">{row.original.descripcion || '-'}</span>,
        enableSorting: false,
        size: 260,
      },
      {
        id: 'codigo',
        accessorKey: 'codigo',
        header: ({ column }) => <DataGridColumnHeader title="Código" column={column} />,
        cell: ({ row }) => <span>{row.original.codigo || '-'}</span>,
        enableSorting: true,
        size: 140,
      },
      {
        id: 'codigoBarras',
        accessorKey: 'codigoBarras',
        header: ({ column }) => <DataGridColumnHeader title="Código de Barras" column={column} />,
        cell: ({ row }) => <span>{row.original.codigoBarras || '-'}</span>,
        enableSorting: true,
        size: 170,
      },
      {
        id: 'marca',
        accessorKey: 'marca',
        header: ({ column }) => <DataGridColumnHeader title="Marca" column={column} />,
        cell: ({ row }) => <span>{row.original.marca || '-'}</span>,
        enableSorting: true,
        size: 140,
      },
      {
        id: 'modelo',
        accessorKey: 'modelo',
        header: ({ column }) => <DataGridColumnHeader title="Modelo" column={column} />,
        cell: ({ row }) => <span>{row.original.modelo || '-'}</span>,
        enableSorting: true,
        size: 140,
      },
      {
        id: 'ubicacion',
        accessorKey: 'ubicacion',
        header: ({ column }) => <DataGridColumnHeader title="Ubicación" column={column} />,
        cell: ({ row }) => <span>{row.original.ubicacion || '-'}</span>,
        enableSorting: true,
        size: 160,
      },
      // booleanos
      {
        id: 'controlaStock',
        accessorKey: 'controlaStock',
        header: ({ column }) => <DataGridColumnHeader title="Controla Stock" column={column} />,
        cell: ({ row }) => <BoolPill value={!!row.original.controlaStock} />,
        enableSorting: true,
        size: 130,
      },
      {
        id: 'destacado',
        accessorKey: 'destacado',
        header: ({ column }) => <DataGridColumnHeader title="Destacado" column={column} />,
        cell: ({ row }) => <BoolPill value={!!row.original.destacado} />,
        enableSorting: true,
        size: 110,
      },
      {
        id: 'esVenta',
        accessorKey: 'esVenta',
        header: ({ column }) => <DataGridColumnHeader title="Es Venta" column={column} />,
        cell: ({ row }) => <BoolPill value={!!row.original.esVenta} />,
        enableSorting: true,
        size: 110,
      },
      {
        id: 'comisiona',
        accessorKey: 'comisiona',
        header: ({ column }) => <DataGridColumnHeader title="Comisiona" column={column} />,
        cell: ({ row }) => <BoolPill value={!!row.original.comisiona} />,
        enableSorting: true,
        size: 120,
      },
      {
        id: 'receta',
        accessorKey: 'receta',
        header: ({ column }) => <DataGridColumnHeader title="Receta" column={column} />,
        cell: ({ row }) => <BoolPill value={!!row.original.receta} />,
        enableSorting: true,
        size: 100,
      },
      // precios
      {
        id: 'precioCosto',
        accessorKey: 'precioCosto',
        header: ({ column }) => <DataGridColumnHeader title="Precio Costo" column={column} />,
        cell: ({ row }) => <span>{fmtMoney(row.original.precioCosto)}</span>,
        enableSorting: true,
        size: 140,
      },
      {
        id: 'precioVentaContado',
        accessorKey: 'precioVentaContado',
        header: ({ column }) => <DataGridColumnHeader title="Precio Contado" column={column} />,
        cell: ({ row }) => <span>{fmtMoney(row.original.precioVentaContado)}</span>,
        enableSorting: true,
        size: 150,
      },
      {
        id: 'precioVentaMayor',
        accessorKey: 'precioVentaMayor',
        header: ({ column }) => <DataGridColumnHeader title="Precio Mayor" column={column} />,
        cell: ({ row }) => <span>{fmtMoney(row.original.precioVentaMayor)}</span>,
        enableSorting: true,
        size: 150,
      },
      {
        id: 'precioVentaCredito',
        accessorKey: 'precioVentaCredito',
        header: ({ column }) => <DataGridColumnHeader title="Precio Crédito" column={column} />,
        cell: ({ row }) => <span>{fmtMoney(row.original.precioVentaCredito)}</span>,
        enableSorting: true,
        size: 160,
      },
      // relaciones (muestra nombre si viene anidado; si no, el Id)
      {
        id: 'almacen',
        accessorKey: 'almacenId',
        header: ({ column }) => <DataGridColumnHeader title="Almacén" column={column} />,
        cell: ({ row }) => <span>{row.original?.almacen?.nombre || row.original.almacenId || '-'}</span>,
        enableSorting: true,
        size: 160,
      },
      {
        id: 'categoria',
        accessorKey: 'categoriaId',
        header: ({ column }) => <DataGridColumnHeader title="Categoría" column={column} />,
        cell: ({ row }) => <span>{row.original?.categoria?.nombre || row.original.categoriaId || '-'}</span>,
        enableSorting: true,
        size: 160,
      },
      {
        id: 'tipoProducto',
        accessorKey: 'tipoProductoId',
        header: ({ column }) => <DataGridColumnHeader title="Tipo Producto" column={column} />,
        cell: ({ row }) => <span>{row.original?.tipoProducto?.nombre || row.original.tipoProductoId || '-'}</span>,
        enableSorting: true,
        size: 170,
      },
      {
        id: 'unidadMedida',
        accessorKey: 'unidadMedidaId',
        header: ({ column }) => <DataGridColumnHeader title="Unidad Medida" column={column} />,
        cell: ({ row }) => <span>{row.original?.unidadMedida?.abreviatura || row.original.unidadMedidaId || '-'}</span>,
        enableSorting: true,
        size: 140,
      },
      {
        id: 'color',
        accessorKey: 'colorId',
        header: ({ column }) => <DataGridColumnHeader title="Color" column={column} />,
        cell: ({ row }) => <span>{row.original?.color?.nombre || row.original.colorId || '-'}</span>,
        enableSorting: true,
        size: 140,
      },
      {
        id: 'afectacion',
        accessorKey: 'afectacionId',
        header: ({ column }) => <DataGridColumnHeader title="Afectación" column={column} />,
        cell: ({ row }) => <span>{row.original?.afectacion?.nombre || row.original.afectacionId || '-'}</span>,
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
            Seleccionaste {selectedRows.length} producto(s): {selectedRows.map((r) => r.id).join(', ')}
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
                placeholder="Buscar producto..."
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
