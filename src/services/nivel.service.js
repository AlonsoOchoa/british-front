import api from './api';

const endpoint = '/Nivel';

export const NivelService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(nivel) {
    const { data } = await api.post(endpoint, nivel);
    return data;
  },

  async update(id, nivel) {
    const { data } = await api.put(`${endpoint}/${id}`, nivel);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
