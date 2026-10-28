import api from './api';

const endpoint = '/Sucursal';

export const SucursalService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(sucursal) {
    const { data } = await api.post(endpoint, sucursal);
    return data;
  },

  async update(id, sucursal) {
    const { data } = await api.put(`${endpoint}/${id}`, sucursal);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
