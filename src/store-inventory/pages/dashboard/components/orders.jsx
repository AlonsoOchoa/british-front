import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardService } from '@/services/dashboard.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const Orders = ({ className }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState('14D');

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getRangeByPeriod = (period) => {
  const hoy = new Date();
  let inicio = new Date();
  let fin = new Date(hoy);

  switch (period) {
    case '1H':
      inicio = new Date(hoy);
      inicio.setHours(hoy.getHours() - 1);
      break;

    case '1D':
      inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - 1);
      break;

    case '14D':
      inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - 14);
      break;

    case '1M':
      inicio = new Date(hoy.getFullYear(), 0, 1);
      fin = new Date(hoy.getFullYear(), 11, 31);
      break;

    case '3M':
      inicio = new Date(hoy.getFullYear(), 0, 1);
      fin = new Date(hoy.getFullYear(), 11, 31);
      break;

    case '1Y':
      inicio = new Date(hoy.getFullYear() - 5, 0, 1);
      fin = new Date(hoy.getFullYear(), 11, 31);
      break;

    case 'All':
      inicio = new Date(2020, 0, 1);
      fin = new Date(hoy.getFullYear(), 11, 31);
      break;

    default:
      inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - 14);
      break;
  }

  return {
    fechaInicio: formatDate(inicio),
    fechaFin: formatDate(fin),
  };
};

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setLoading(true);

        const { fechaInicio, fechaFin } = getRangeByPeriod(activePeriod);

        const data = await DashboardService.getVentas({
          fechaInicio,
          fechaFin,
          periodo: activePeriod,
        });

        setDashboard(data);
      } catch (error) {
        console.error('Error al cargar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, [activePeriod]);

  const chartData = useMemo(() => {
    if (!dashboard?.ventasPorDia) return [];

    return dashboard.ventasPorDia.map((item) => ({
      name: item.label,
      value: item.total,
    }));
  }, [dashboard]);

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="flex flex-col gap-2 p-3.5 bg-background border border-border rounded-lg shadow-lg">
          <div className="font-medium text-sm text-secondary-foreground">
            {label}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="font-semibold text-base text-mono">
              S/ {Number(value).toFixed(2)}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ventas</CardTitle>
        <Button mode="link" underline="solid" asChild>
          <Link to="#">Ver detalle</Link>
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col justify-between gap-2 p-0 lg:pt-7.5 pt-5">
        <div>
          <ToggleGroup
            type="single"
            variant="outline"
            value={activePeriod}
            onValueChange={(value) => {
              if (value) setActivePeriod(value);
            }}
            className="grid grid-cols-7 mb-6 mx-5 lg:mx-7.5 !data-[variant=outline]:shadow-none"
          >
            {['1H', '1D', '14D', '1M', '3M', '1Y', 'All'].map((period) => (
              <ToggleGroupItem className="h-[28px]" key={period} value={period}>
                {period}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="flex items-center gap-2.5 px-5 lg:px-7.5 mb-1.5">
            <span className="text-3xl font-semibold text-foreground">
              {loading
                ? 'Cargando...'
                : `S/ ${Number(dashboard?.totalVentas ?? 0).toFixed(2)}`}
            </span>

            {!loading && (
              <Badge size="sm" variant="secondary" appearance="light">
                {dashboard?.cantidadVentas ?? 0} ventas
              </Badge>
            )}
          </div>

          {!loading && (
            <div className="px-5 lg:px-7.5 text-sm text-muted-foreground mb-4">
              Ticket promedio: S/ {Number(dashboard?.ticketPromedio ?? 0).toFixed(2)}
            </div>
          )}
        </div>

        <div className="h-48 w-full px-0 mb-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 30,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="5 5"
                stroke="var(--border)"
                horizontal={true}
                vertical={false}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: 'var(--muted-foreground)',
                  textAnchor: 'middle',
                }}
              />

              <YAxis hide />
              <Tooltip content={customTooltip} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                fill="url(#orderGradient)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: 'var(--primary)',
                  stroke: 'white',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export { Orders };