import api from './api';

const endpoint = '/Rol';

export const RolService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(rol) {
    const { data } = await api.post(endpoint, rol);
    return data;
  },

  async update(id, rol) {
    const { data } = await api.put(`${endpoint}/${id}`, rol);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },

  async updatePermisos(id, permisos) {
    const { data } = await api.put(`${endpoint}/${id}/permisos`, permisos);
    return data;
  },
};
