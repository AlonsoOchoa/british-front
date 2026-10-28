import api from './api';

const endpoint = '/Empresa';

export const EmpresaService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(empresa) {
    const { data } = await api.post(endpoint, empresa);
    return data;
  },

  async update(id, empresa) {
    const { data } = await api.put(`${endpoint}/${id}`, empresa);
    return data;
  },

  async updateImagen(id, imagen) {
    const formData = new FormData();

    // Si se envía una imagen, la agregamos
    if (imagen instanceof File) {
      formData.append('imagen', imagen);
    }

    // Si no se envía imagen => se eliminará en backend
    const { data } = await api.put(`${endpoint}/${id}/Imagen`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`${endpoint}/${id}`);
    return data;
  },

  toFormData(empresa) {
    const formData = new FormData();

    for (const key in empresa) {
      if (empresa[key] !== null && empresa[key] !== undefined) {
        if (key === 'imagen' && empresa[key] instanceof File) {
          formData.append('imagen', empresa[key]);
        } else {
          // 👇 aquí el truco: asegurar que Id esté capitalizado
          const fieldName = key === 'id' ? 'Id' : key;
          formData.append(fieldName, empresa[key]);
        }
      }
    }

    return formData;
  },
};