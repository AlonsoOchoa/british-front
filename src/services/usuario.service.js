import api from './api';

const endpoint = '/Usuario';

export const UsuarioService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(usuario) {
    const { data } = await api.post(endpoint, usuario);
    return data;
  },

  async update(id, usuario) {
    const { data } = await api.put(`${endpoint}/${id}`, usuario);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
