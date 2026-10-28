import api from './api';

const endpoint = '/Servicio';

export const ServicioService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(servicio) {
    const { data } = await api.post(endpoint, servicio);
    return data;
  },

  async update(id, servicio) {
    const { data } = await api.put(`${endpoint}/${id}`, servicio);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
