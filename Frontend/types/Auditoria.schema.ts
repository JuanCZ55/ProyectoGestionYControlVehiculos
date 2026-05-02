import { z } from "zod";
import { UsuarioSchema } from "./Usuario.schema";
export const AuditoriaSchema = z.object({
  idAuditoria: z.number(),
  fecha: z.coerce.date(),
  idEntidad: z.number(),
  entidad: z.string(),
  accion: z.string(),
  idUsuario: z.number(),
  usuario: UsuarioSchema.nullable(),
});
export type AuditoriaType = z.infer<typeof AuditoriaSchema>;
