/** @type {import('next').NextConfig} */
// Em produção (Render) a URL do backend chega sem esquema (ex.: clareia-backend.onrender.com);
// em dev local cai para http://localhost:8080.
const RAW_API = process.env.CLAREIA_API_URL || "http://localhost:8080";
const API_TARGET = /^https?:\/\//.test(RAW_API) ? RAW_API : `https://${RAW_API}`;

const nextConfig = {
  // Encaminha as chamadas /api para o backend Spring Boot, evitando CORS:
  // o navegador fala sempre com a mesma origem (o servidor Next).
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_TARGET}/api/:path*` },
    ];
  },
};

export default nextConfig;
