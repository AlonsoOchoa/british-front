import api from './api';

const endpoint = '/Producto';

export const ProductoService = {
  async getAll() {
    const { data } = await api.get(endpoint);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`${endpoint}/${id}`);
    return data;
  },

  async create(producto) {
    const { data } = await api.post(endpoint, producto);
    return data;
  },

  async update(id, producto) {
    const { data } = await api.put(`${endpoint}/${id}`, producto);
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

  toFormData(producto) {
    const formData = new FormData();

    for (const key in producto) {
      if (producto[key] !== null && producto[key] !== undefined) {
        if (key === 'imagen' && producto[key] instanceof File) {
          formData.append('imagen', producto[key]);
        } else {
          // 👇 aquí el truco: asegurar que Id esté capitalizado
          const fieldName = key === 'id' ? 'Id' : key;
          formData.append(fieldName, producto[key]);
        }
      }
    }

    return formData;
  },
};