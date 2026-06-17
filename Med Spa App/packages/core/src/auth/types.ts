export interface LoginParams {
  email: string;
  password: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  clinic_name: string;
  clinic_location?: string;
}
