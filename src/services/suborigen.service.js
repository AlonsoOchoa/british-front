import api from './api';

const endpoint = '/SubOrigen';

export const SubOrigenService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(subOrigen) {
    const { data } = await api.post(endpoint, subOrigen);
    return data;
  },

  async update(id, subOrigen) {
    const { data } = await api.put(`${endpoint}/${id}`, subOrigen);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
