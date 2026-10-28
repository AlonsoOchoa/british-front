import api from './api';

const endpoint = '/Color';

export const ColorService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(color) {
    const { data } = await api.post(endpoint, color);
    return data;
  },

  async update(id, color) {
    const { data } = await api.put(`${endpoint}/${id}`, color);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
