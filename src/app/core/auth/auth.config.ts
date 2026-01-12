export const KEYCLOAK_CONFIG = {
  url: 'http://localhost:8080',
  realm: 'f1-management',
  clientId: 'f1-frontend',
  clientSecret: '',
};

export const TOKEN_ENDPOINT = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`;
export const USERINFO_ENDPOINT = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/userinfo`;
export const LOGOUT_ENDPOINT = `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/logout`;