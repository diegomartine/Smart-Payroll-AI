/** Coincide con el modelo `Position` de prisma/schema.prisma. */
export interface Position {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Cuerpo para POST /positions (CreatePositionDto). */
export interface CreatePositionPayload {
  name: string;
  isActive?: boolean;
}

/** Cuerpo para PATCH /positions/:id (UpdatePositionDto = Partial). */
export type UpdatePositionPayload = Partial<CreatePositionPayload>;
