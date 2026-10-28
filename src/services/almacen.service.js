import api from './api';

const endpoint = '/Almacen';

export const AlmacenService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(almacen) {
    const { data } = await api.post(endpoint, almacen);
    return data;
  },

  async update(id, almacen) {
    const { data } = await api.put(`${endpoint}/${id}`, almacen);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
