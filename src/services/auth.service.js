import api from "./api";

export const AuthService = {
  async login(username, password) {
    const { data } = await api.post("/auth/login", { username, password });
    const token = data.token;

    localStorage.setItem("token", token);

    // 🔍 Decodificamos el payload del JWT
    const payload = JSON.parse(atob(token.split(".")[1]));

    // 🔐 Obtenemos los permisos
    const permisos = payload["permisos"] || [];
    localStorage.setItem("permisos", JSON.stringify(permisos));

    // Guardamos también los datos básicos del usuario
    const usuario = {
      id: payload["nameid"],
      username: payload["unique_name"],
      role: payload["role"],
    };
    localStorage.setItem("usuario", JSON.stringify(usuario));

    return { token, usuario, permisos };
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("permisos");
  },

  getPermisos() {
    return JSON.parse(localStorage.getItem("permisos") || "[]");
  },

  getUsuario() {
    return JSON.parse(localStorage.getItem("usuario") || "{}");
  },
};
