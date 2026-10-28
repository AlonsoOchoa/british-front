import api from './api';

const endpoint = '/HorarioDetalle';

export const HorarioDetalleService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(horarioDetalle) {
    const { data } = await api.post(endpoint, horarioDetalle);
    return data;
  },

  async update(id, horarioDetalle) {
    const { data } = await api.put(`${endpoint}/${id}`, horarioDetalle);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
