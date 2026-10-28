'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardService } from '@/services/dashboard.service';

const PERIODS = {
  '7d': { key: '7d', label: 'Últimos 7 días' },
  '30d': { key: '30d', label: 'Últimos 30 días' },
  '90d': { key: '90d', label: 'Últimos 90 días' },
  '12m': { key: '12m', label: 'Últimos 12 meses' },
};

const ChartLabel = ({ label, color }) => {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-1 h-3 rounded-full"
        style={{ backgroundColor: color }}
      ></div>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm shadow-black/5 min-w-[170px]">
        <div className="text-xs font-medium text-muted-foreground tracking-wide mb-2.5">
          {label}
        </div>
        <div className="space-y-2">
          {payload.map((entry, index) => {
            let itemLabel = '';
            if (entry.dataKey === 'lima') itemLabel = 'Lima';
            if (entry.dataKey === 'arequipa') itemLabel = 'Arequipa';
            if (entry.dataKey === 'cusco') itemLabel = 'Cusco';

            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <ChartLabel label={itemLabel + ':'} color={entry.color} />
                <span className="font-semibold text-foreground">
                  {entry.value.toLocaleString()} ventas
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const getFechasPorPeriodo = (periodo) => {
  const hoy = new Date();
  const fechaFin = new Date(hoy);
  const fechaInicio = new Date(hoy);

  switch (periodo) {
    case '7d':
      fechaInicio.setDate(hoy.getDate() - 6);
      break;
    case '30d':
      fechaInicio.setDate(hoy.getDate() - 29);
      break;
    case '90d':
      fechaInicio.setDate(hoy.getDate() - 89);
      break;
    case '12m':
      fechaInicio.setMonth(hoy.getMonth() - 11);
      fechaInicio.setDate(1);
      break;
    default:
      fechaInicio.setDate(hoy.getDate() - 29);
      break;
  }

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    fechaInicio: formatDate(fechaInicio),
    fechaFin: formatDate(fechaFin),
  };
};

export function ProductStock() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarGrafico = async () => {
      try {
        setLoading(true);

        const { fechaInicio, fechaFin } = getFechasPorPeriodo(selectedPeriod);

        const response =
          await DashboardService.getGraficoVentasPorSucursal({
            fechaInicio,
            fechaFin,
            periodo: selectedPeriod,
          });

        const dataMapeada = (response ?? []).map((item) => ({
          period: item.periodo,
          lima: item.lima ?? 0,
          arequipa: item.arequipa ?? 0,
          cusco: item.cusco ?? 0,
        }));

        setChartData(dataMapeada);
      } catch (error) {
        console.error('Error al cargar gráfico de ventas por sucursal:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    cargarGrafico();
  }, [selectedPeriod]);

  const totalLima = useMemo(
    () => chartData.reduce((sum, item) => sum + item.lima, 0),
    [chartData]
  );

  const totalArequipa = useMemo(
    () => chartData.reduce((sum, item) => sum + item.arequipa, 0),
    [chartData]
  );

  const totalCusco = useMemo(
    () => chartData.reduce((sum, item) => sum + item.cusco, 0),
    [chartData]
  );

  const totalVentas = totalLima + totalArequipa + totalCusco;

  const sucursales = [
    { nombre: 'Lima', total: totalLima },
    { nombre: 'Arequipa', total: totalArequipa },
    { nombre: 'Cusco', total: totalCusco },
  ].sort((a, b) => b.total - a.total);

  const sucursalLider = sucursales[0] ?? { nombre: '-', total: 0 };

  const liderazgoPorcentaje =
    totalVentas > 0 ? Math.round((sucursalLider.total / totalVentas) * 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Ventas por sucursal</CardTitle>

        <CardToolbar>
          <Select
            value={selectedPeriod}
            onValueChange={(value) => setSelectedPeriod(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {Object.values(PERIODS).map((period) => (
                <SelectItem key={period.key} value={period.key}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardToolbar>
      </CardHeader>

      <CardContent className="px-2 py-6">
        <div className="flex items-center flex-wrap gap-3.5 md:gap-10 px-5 pt-6 mb-8 text-sm">
          <div className="flex items-center gap-3.5">
            <ChartLabel label="Total ventas" color="#f59e0b" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {loading ? '...' : totalVentas.toLocaleString()}
              </span>
              <Badge variant="success" appearance="light">
                <TrendingUp className="size-3" />
                Activo
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <ChartLabel label="Sucursal líder" color="#8b5cf6" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {loading ? '...' : sucursalLider.nombre}
              </span>
              <Badge variant="success" appearance="light">
                <TrendingUp className="size-3" />
                {loading ? '...' : `${liderazgoPorcentaje}%`}
              </Badge>
            </div>
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 30,
                right: 5,
                left: 5,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="4 12"
                stroke="hsl(var(--muted))"
                strokeOpacity={1}
                horizontal={true}
                vertical={false}
              />

              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickMargin={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickMargin={10}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  strokeDasharray: '3 3',
                  stroke: 'hsl(var(--muted-foreground))',
                  strokeOpacity: 0.5,
                }}
              />

              <Line
                type="linear"
                dataKey="lima"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
              />

              <Line
                type="linear"
                dataKey="arequipa"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 0 }}
              />

              <Line
                type="linear"
                dataKey="cusco"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}