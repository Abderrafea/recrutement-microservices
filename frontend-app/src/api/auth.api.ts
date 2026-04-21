import api from './axiosInstance';
import type {
  LoginResponse,
  RegisterPayload,
  Role,
  UpdateProfilePayload,
  UserProfile,
  UserSummary,
} from '../types/user.types';

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<LoginResponse>('/api/users/login', payload);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<UserProfile>('/api/users/register', payload);
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get<UserProfile>('/api/users/me');
  return data;
}

export async function updateProfile(userId: number, payload: UpdateProfilePayload) {
  const { data } = await api.put<UserProfile>(`/api/users/${userId}`, payload);
  return data;
}

export async function uploadCv(userId: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<UserProfile>(`/api/users/${userId}/cv`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function listUsers(role?: Role) {
  const { data } = await api.get<UserSummary[]>('/api/users', {
    params: role ? { role } : undefined,
  });
  return data;
}

export async function deleteUser(userId: number) {
  await api.delete(`/api/users/${userId}`);
}
