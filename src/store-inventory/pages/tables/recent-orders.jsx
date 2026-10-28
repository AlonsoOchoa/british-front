'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { DashboardService } from '@/services/dashboard.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Input, InputWrapper } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const meses = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const DashboardTable = () => {
  const fechaActual = new Date();

  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mes, setMes] = useState(fechaActual.getMonth() + 1);
  const [anio, setAnio] = useState(fechaActual.getFullYear());
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState([{ id: 'avancePorcentaje', desc: true }]);
  const inputRef = useRef(null);

  const cargarRanking = async () => {
    try {
      setLoading(true);

      const result = await DashboardService.getRankingVendedores({
        mes,
        anio,
      });

      setData(result || []);
    } catch (error) {
      console.error('Error al cargar ranking de vendedores:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRanking();
  }, [mes, anio]);

  const getEstadoAvance = (avance) => {
    if (avance >= 100) return { label: 'Cumplido', variant: 'success' };
    if (avance >= 80) return { label: 'Cerca', variant: 'warning' };
    if (avance >= 50) return { label: 'En progreso', variant: 'info' };
    return { label: 'Crítico', variant: 'destructive' };
  };

  const columns = useMemo(
    () => [
      {
        id: 'vendedor',
        accessorFn: (row) => row.vendedor,
        header: ({ column }) => (
          <DataGridColumnHeader title="Vendedor" column={column} />
        ),
        cell: (info) => info.row.original.vendedor,
        enableSorting: true,
        size: 240,
      },
      {
        id: 'sucursal',
        accessorFn: (row) => row.sucursal,
        header: ({ column }) => (
          <DataGridColumnHeader title="Sucursal" column={column} />
        ),
        cell: (info) => info.row.original.sucursal,
        enableSorting: true,
        size: 160,
      },
      {
        id: 'metaMensual',
        accessorFn: (row) => row.metaMensual,
        header: ({ column }) => (
          <DataGridColumnHeader title="Meta mensual" column={column} />
        ),
        cell: (info) => (
          <span className="font-medium">
            {info.row.original.metaMensual}
          </span>
        ),
        enableSorting: true,
        size: 150,
      },
      {
        id: 'ventasMes',
        accessorFn: (row) => row.ventasMes,
        header: ({ column }) => (
          <DataGridColumnHeader title="Ventas del mes" column={column} />
        ),
        cell: (info) => (
          <span className="font-semibold text-primary">
            {info.row.original.ventasMes}
          </span>
        ),
        enableSorting: true,
        size: 160,
      },
      {
        id: 'avancePorcentaje',
        accessorFn: (row) => row.avancePorcentaje,
        header: ({ column }) => (
          <DataGridColumnHeader title="Avance %" column={column} />
        ),
        cell: (info) => {
          const avance = Number(info.row.original.avancePorcentaje || 0);
          const estado = getEstadoAvance(avance);

          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold">{avance}%</span>
              <Badge variant={estado.variant} appearance="light">
                {estado.label}
              </Badge>
            </div>
          );
        },
        enableSorting: true,
        size: 190,
      },
    ],
    [],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    const query = searchQuery.toLowerCase();

    return data.filter((item) => {
      return (
        item.vendedor?.toLowerCase().includes(query) ||
        item.sucursal?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, data]);

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row) => String(row.vendedorId),
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const Toolbar = () => {
    const [inputValue, setInputValue] = useState(searchQuery);

    useEffect(() => {
      const timer = setTimeout(() => {
        setSearchQuery(inputValue);
      }, 300);

      return () => clearTimeout(timer);
    }, [inputValue]);

    return (
      <CardToolbar>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
        >
          {meses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <Input
          type="number"
          className="w-24"
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
        />

        <div className="w-full max-w-[220px]">
          <InputWrapper>
            <Search />
            <Input
              placeholder="Buscar vendedor o sucursal"
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />

            <Button
              onClick={() => setInputValue('')}
              variant="dim"
              className="-me-4"
              disabled={inputValue === ''}
            >
              {inputValue !== '' && <X size={16} />}
            </Button>
          </InputWrapper>
        </div>
      </CardToolbar>
    );
  };

  return (
    <DataGrid
      table={table}
      recordCount={filteredData?.length || 0}
      tableLayout={{
        columnsPinnable: true,
        columnsMovable: true,
        columnsVisibility: true,
        cellBorder: true,
      }}
    >
      <Card>
        <CardHeader className="py-3.5">
          <CardTitle>
            Ranking de vendedores {loading ? '(cargando...)' : ''}
          </CardTitle>
          <Toolbar />
        </CardHeader>

        <CardTable>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardTable>

        <CardFooter>
          <DataGridPagination />
        </CardFooter>
      </Card>
    </DataGrid>
  );
};

export { DashboardTable };