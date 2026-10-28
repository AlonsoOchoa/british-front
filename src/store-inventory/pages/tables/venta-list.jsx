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
import { VentaService } from '@/services/venta.service';
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

export function VentaListTable({
  onCountChange,
  onRowSelect,
  updatedVenta,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  filtrosAplicados,
}) {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);

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
        value ? 'bg-green-100 text-green-700' : 'bg-muted text-foreground/70',
      )}
    >
      {value ? 'Sí' : 'No'}
    </span>
  );

  const fmtDateTime = (v) => (v ? new Date(v).toLocaleString() : '-');

  const fetchData = async (inicio, fin) => {
    try {
      const response = await VentaService.getAll({
        fechaInicio: inicio,
        fechaFin: fin,
      });

      setData(response ?? []);
      onCountChange?.((response ?? []).length);
      setRowSelection({});
      onRowSelect?.([]);
      setPagination((prev) => ({
        ...prev,
        pageIndex: 0,
      }));
    } catch (error) {
      console.error(error);
      toast.error('Error al obtener las ventas');
    }
  };

  useEffect(() => {
    if (!filtrosAplicados?.fechaInicio || !filtrosAplicados?.fechaFin) return;
    fetchData(filtrosAplicados.fechaInicio, filtrosAplicados.fechaFin);
  }, [filtrosAplicados]);

  useEffect(() => {
    if (!updatedVenta) return;

    setData((prev) => {
      if (updatedVenta.deleted) {
        if (updatedVenta.ids && Array.isArray(updatedVenta.ids)) {
          return prev.filter((i) => !updatedVenta.ids.includes(i.id));
        } else if (updatedVenta.id) {
          return prev.filter((i) => i.id !== updatedVenta.id);
        }
      }

      if (updatedVenta.id) {
        const exists = prev.some((x) => x.id === updatedVenta.id);
        return exists
          ? prev.map((i) =>
              i.id === updatedVenta.id ? { ...i, ...updatedVenta } : i,
            )
          : [updatedVenta, ...prev];
      }

      return prev;
    });

    setRowSelection({});
    onRowSelect?.([]);
  }, [updatedVenta]);

  useEffect(() => {
    onCountChange?.(data.length);
  }, [data]);

  const tabs = [
    { id: 'all', label: 'Todos' },
    { id: 'completo', label: 'Completo' },
    { id: 'parcial', label: 'Parcial' },
  ];

  const [activeTab, setActiveTab] = useState('all');

  const filteredData = useMemo(() => {
    let result = [...data];

    // 🔹 Filtro por tabs / estado
    if (activeTab === 'all') {
      result = result.filter((item) => item.estado !== 'X');
    } else if (activeTab === 'completo') {
      result = result.filter((item) => item.estado === '0');
    } else if (activeTab === 'parcial') {
      result = result.filter((item) => item.estado === '1');
    }

    if (!searchQuery) return result;

    const q = searchQuery.toLowerCase();
    const safeText = (x) => (x ?? '').toString().toLowerCase();

    return result.filter((item) => {
      const relNombre = [
        item?.vendedor?.empleado?.nombres,
        item?.vendedor?.nombre,
        item?.origen?.nombre,
        item?.subOrigen?.nombre,
        item?.horario?.nombre,
        item?.horarioDetalle?.nombre,
        item?.nivel?.nombre,
      ]
        .filter(Boolean)
        .map((x) => x.toLowerCase())
        .join(' ');

      return (
        safeText(item.id).includes(q) ||
        safeText(item.nombre).includes(q) ||
        safeText(item.nroDocumento).includes(q) ||
        safeText(item.celular).includes(q) ||
        safeText(item.correo).includes(q) ||
        safeText(item.matricula).includes(q) ||
        safeText(item.pension).includes(q) ||
        safeText(item.lugarResidencia).includes(q) ||
        safeText(item.estado).includes(q) ||
        relNombre.includes(q)
      );
    });
  }, [data, activeTab, searchQuery]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'check',
        accessorFn: (row) => row.id,
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        size: 50,
      },
      {
        id: 'id',
        accessorKey: 'id',
        header: ({ column }) => (
          <DataGridColumnHeader title="ID" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.id}</span>,
        enableSorting: true,
        size: 90,
      },
      {
        id: 'nombre',
        accessorKey: 'nombre',
        header: ({ column }) => (
          <DataGridColumnHeader title="Nombre" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.nombre || '-'}</span>,
        enableSorting: true,
        size: 220,
      },
      {
        id: 'nroDocumento',
        accessorKey: 'nroDocumento',
        header: ({ column }) => (
          <DataGridColumnHeader title="Documento" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.nroDocumento || '-'}</span>,
        enableSorting: true,
        size: 140,
      },
      {
        id: 'celular',
        accessorKey: 'celular',
        header: ({ column }) => (
          <DataGridColumnHeader title="Celular" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.celular || '-'}</span>,
        enableSorting: true,
        size: 130,
      },
      {
        id: 'nivel',
        accessorKey: 'nivelId',
        header: ({ column }) => (
          <DataGridColumnHeader title="Nivel" column={column} />
        ),
        cell: ({ row }) => <span>{row.original?.nivel?.nombre || '-'}</span>,
        enableSorting: true,
        size: 130,
      },
      {
        id: 'vendedor',
        accessorKey: 'vendedorId',
        header: ({ column }) => (
          <DataGridColumnHeader title="Vendedor" column={column} />
        ),
        cell: ({ row }) => {
          const empleado = row.original?.vendedor?.empleado;

          return (
            <span>
              {empleado
                ? `${empleado.nombres ?? ''} ${empleado.apellidos ?? ''}`.trim()
                : row.original?.vendedor?.codigo || '-'}
            </span>
          );
        },
        enableSorting: true,
        size: 250,
      },
      {
        id: 'contactado',
        accessorKey: 'contactado',
        header: ({ column }) => (
          <DataGridColumnHeader title="Contactado" column={column} />
        ),
        cell: ({ row }) => <BoolPill value={!!row.original.contactado} />,
        enableSorting: true,
        size: 130,
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
            0: { label: 'Completo', variant: 'success' },
            1: { label: 'Parcial', variant: 'warning' },
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
        size: 150,
      },
      {
        id: 'origen',
        accessorKey: 'origenId',
        header: ({ column }) => (
          <DataGridColumnHeader title="Origen" column={column} />
        ),
        cell: ({ row }) => <span>{row.original?.origen?.nombre || '-'}</span>,
        enableSorting: true,
        size: 150,
      },
      {
        id: 'subOrigen',
        accessorKey: 'subOrigenId',
        header: ({ column }) => (
          <DataGridColumnHeader title="Sub Origen" column={column} />
        ),
        cell: ({ row }) => (
          <span>{row.original?.subOrigen?.nombre || '-'}</span>
        ),
        enableSorting: true,
        size: 170,
      },
      {
        id: 'horario',
        accessorKey: 'horarioId',
        header: ({ column }) => (
          <DataGridColumnHeader title="Horario" column={column} />
        ),
        cell: ({ row }) => <span>{row.original?.horario?.nombre || '-'}</span>,
        enableSorting: true,
        size: 150,
      },
      {
        id: 'horarioDetalle',
        accessorKey: 'horarioDetalleId',
        header: ({ column }) => (
          <DataGridColumnHeader title="Horario Detalle" column={column} />
        ),
        cell: ({ row }) => (
          <span>{row.original?.horarioDetalle?.nombre || '-'}</span>
        ),
        enableSorting: true,
        size: 250,
      },
      {
        id: 'matricula',
        accessorKey: 'matricula',
        header: ({ column }) => (
          <DataGridColumnHeader title="Matrícula" column={column} />
        ),
        cell: ({ row }) => <span>{fmtMoney(row.original.matricula)}</span>,
        enableSorting: true,
        size: 120,
      },
      {
        id: 'pension',
        accessorKey: 'pension',
        header: ({ column }) => (
          <DataGridColumnHeader title="Pensión" column={column} />
        ),
        cell: ({ row }) => <span>{fmtMoney(row.original.pension)}</span>,
        enableSorting: true,
        size: 120,
      },
      {
        id: 'userNew',
        accessorKey: 'userNew',
        header: ({ column }) => (
          <DataGridColumnHeader title="Usuario Creación" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.userNew || '-'}</span>,
        enableSorting: true,
        size: 170,
      },
      {
        id: 'dateNew',
        accessorKey: 'dateNew',
        header: ({ column }) => (
          <DataGridColumnHeader title="Fecha Creación" column={column} />
        ),
        cell: ({ row }) => <span>{fmtDateTime(row.original.dateNew)}</span>,
        enableSorting: true,
        size: 190,
      },
      {
        id: 'userEdit',
        accessorKey: 'userEdit',
        header: ({ column }) => (
          <DataGridColumnHeader title="Usuario Edición" column={column} />
        ),
        cell: ({ row }) => <span>{row.original.userEdit || '-'}</span>,
        enableSorting: true,
        size: 170,
      },
      {
        id: 'dateEdit',
        accessorKey: 'dateEdit',
        header: ({ column }) => (
          <DataGridColumnHeader title="Fecha Edición" column={column} />
        ),
        cell: ({ row }) => <span>{fmtDateTime(row.original.dateEdit)}</span>,
        enableSorting: true,
        size: 190,
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
            Seleccionaste {selectedRows.length} venta(s):{' '}
            {selectedRows.map((r) => r.id).join(', ')}
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
                placeholder="Buscar venta..."
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
          <Input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-[140px]"
          />

          <Input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-[140px]"
          />
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
