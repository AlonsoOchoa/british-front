import api from './api';

const endpoint = '/TipoIdentidad';

export const TipoIdentidadService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(tipoidentidad) {
    const { data } = await api.post(endpoint, tipoidentidad);
    return data;
  },

  async update(id, tipoidentidad) {
    const { data } = await api.put(`${endpoint}/${id}`, tipoidentidad);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
