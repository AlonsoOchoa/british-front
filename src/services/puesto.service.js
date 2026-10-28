import api from './api';

const endpoint = '/Puesto';

export const PuestoService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(puesto) {
    const { data } = await api.post(endpoint, puesto);
    return data;
  },

  async update(id, puesto) {
    const { data } = await api.put(`${endpoint}/${id}`, puesto);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
