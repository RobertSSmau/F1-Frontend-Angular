export interface User {
  sub: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  realm_access?: {
    roles: string[];
  };
}

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
}