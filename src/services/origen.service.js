import api from './api';

const endpoint = '/Origen';

export const OrigenService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(origen) {
    const { data } = await api.post(endpoint, origen);
    return data;
  },

  async update(id, origen) {
    const { data } = await api.put(`${endpoint}/${id}`, origen);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
