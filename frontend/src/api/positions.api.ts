import { api } from './axios';
import type {
  CreatePositionPayload,
  Position,
  UpdatePositionPayload,
} from '../types/position.types';

export const positionsApi = {
  list: () => api.get<Position[]>('/positions').then((res) => res.data),

  listActive: () =>
    api.get<Position[]>('/positions/active').then((res) => res.data),

  getById: (id: number) =>
    api.get<Position>(`/positions/${id}`).then((res) => res.data),

  create: (payload: CreatePositionPayload) =>
    api.post<Position>('/positions', payload).then((res) => res.data),

  update: (id: number, payload: UpdatePositionPayload) =>
    api.patch<Position>(`/positions/${id}`, payload).then((res) => res.data),

  deactivate: (id: number) =>
    api.patch<Position>(`/positions/${id}/deactivate`).then((res) => res.data),
};
