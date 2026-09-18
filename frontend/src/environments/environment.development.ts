// Fase 0/1: el frontend habla directo con catalog-api.
// A partir de la Fase 4 (API Gateway) esta URL apuntará al Gateway
// y dejará de apuntar a los microservicios individuales.
export const environment = {
  apiBaseUrl: 'http://localhost:8080/api',
};
