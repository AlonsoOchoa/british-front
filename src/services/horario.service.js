import api from './api';

const endpoint = '/Horario';

export const HorarioService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(horario) {
    const { data } = await api.post(endpoint, horario);
    return data;
  },

  async update(id, horario) {
    const { data } = await api.put(`${endpoint}/${id}`, horario);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
