import api from './api';

const endpoint = '/Area';

export const AreaService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(area) {
    const { data } = await api.post(endpoint, area);
    return data;
  },

  async update(id, area) {
    const { data } = await api.put(`${endpoint}/${id}`, area);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
