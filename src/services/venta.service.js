import api from './api';


const endpoint = '/Venta';

export const VentaService = {
  async getAll(params) {
    const { data } = await api.get(endpoint, { params });
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(formData) {
    const { data } = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async update(id, formData) {
    const { data } = await api.put(`${endpoint}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },

  async exportarVentas(params) {
  const response = await api.get('/Venta/exportar', {
      params,
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', 'Ventas.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};