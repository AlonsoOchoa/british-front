import api from './api';

const endpoint = '/UnidadMedida';

export const UnidadMedidaService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(unidadmedida) {
    const { data } = await api.post(endpoint, unidadmedida);
    return data;
  },

  async update(id, unidadmedida) {
    const { data } = await api.put(`${endpoint}/${id}`, unidadmedida);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
