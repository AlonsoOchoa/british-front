import api from './api';

const endpoint = '/Vendedor';

export const VendedorService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getVendedorActual() {
    const { data } = await api.get(`${endpoint}/me`);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(vendedor) {
    const { data } = await api.post(endpoint, vendedor);
    return data;
  },

  async update(id, vendedor) {
    const { data } = await api.put(`${endpoint}/${id}`, vendedor);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },
};
