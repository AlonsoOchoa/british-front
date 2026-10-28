import api from './api';

const endpoint = '/Afectacion';

export const AfectacionService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(afectacion) {
    const { data } = await api.post(endpoint, afectacion);
    return data;
  },

  async update(id, afectacion) {
    const { data } = await api.put(`${endpoint}/${id}`, afectacion);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
