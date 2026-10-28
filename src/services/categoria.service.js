import api from './api';

const endpoint = '/Categoria';

export const CategoriaService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(categoria) {
    const { data } = await api.post(endpoint, categoria);
    return data;
  },

  async update(id, categoria) {
    const { data } = await api.put(`${endpoint}/${id}`, categoria);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
