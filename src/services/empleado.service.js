import api from './api';

const endpoint = '/Empleado';

export const EmpleadoService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(empleado) {
    const { data } = await api.post(endpoint, empleado);
    return data;
  },

  async update(id, empleado) {
    const { data } = await api.put(`${endpoint}/${id}`, empleado);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
