import axios from "axios";

const API = axios.create({
  baseURL: "https://campus-lost-found-api-hud7.onrender.com/api",
});

export default API;