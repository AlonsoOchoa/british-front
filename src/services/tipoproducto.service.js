import api from './api';

const endpoint = '/TipoProducto';

export const TipoProductoService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(tipoproducto) {
    const { data } = await api.post(endpoint, tipoproducto);
    return data;
  },

  async update(id, tipoproducto) {
    const { data } = await api.put(`${endpoint}/${id}`, tipoproducto);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
