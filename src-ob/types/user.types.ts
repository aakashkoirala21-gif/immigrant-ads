
export interface RegisterInput {
  full_name: string;
  email: string;
  password: string;
  role?: 'user' | 'professional' | 'admin';
}

export interface BookingPayload {
  professionalId: string;
  startTime: string;
  endTime: string;
  symptoms?: string[];
  documents?: string[];
}