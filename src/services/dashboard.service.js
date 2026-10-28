// dashboard.service.js
import api from './api';

const endpoint = '/DashboardVenta';

export const DashboardService = {
  async getVentas(params) {
    const { data } = await api.get(`${endpoint}/ventas`, { params });
    return data;
  },

  async getGraficoVentasPorSucursal(params) {
    const { data } = await api.get(`${endpoint}/grafico-ventas-por-sucursal`, { params });
    return data;
  },

  async getRankingVendedores(params) {
    const { data } = await api.get(`${endpoint}/ranking-vendedores`, { params });
    return data;
  },
};