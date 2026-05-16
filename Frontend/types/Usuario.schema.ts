import { z } from "zod";

export const RolSchema = z.object({
  idRol: z.number(),
  nombre: z.string(),
  estado: z.boolean(),
});

export const PersonaSchema = z.object({
  idPersona: z.number(),
  nombre: z.string(),
  apellido: z.string(),
  dni: z.number(),
  fechaNac: z.coerce.date(),
  estado: z.boolean(),
});
export const PersonaSchemeValidator = z.object({
  idPersona: z.number().optional(),
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres")
    .regex(/^[^0-9]*$/, { message: "El nombre no puede contener números" }),
  apellido: z
    .string()
    .min(3, "El apellido debe tener al menos 3 caracteres")
    .max(50, "El apellido no puede tener más de 50 caracteres")
    .regex(/^[^0-9]*$/, { message: "El apellido no puede contener números" }),
  dni: z
    .number()
    .min(1000000, "El DNI debe tener al menos 7 caracteres")
    .max(99999999, "El DNI no puede tener más de 8 caracteres"),
  fechaNac: z.coerce
    .date()
    .min(
      new Date("1900-01-01"),
      "La fecha de nacimiento no puede ser anterior al 1 de enero de 1900",
    )
    .max(
      new Date(),
      "La fecha de nacimiento no puede ser posterior a la fecha actual",
    ),
  estado: z.boolean(),
});
export const UsuarioSchema = z.object({
  idUsuario: z.number(),
  gmail: z.string().email(),
  avatarUrl: z.string().nullable().optional(),
  idRol: z.number(),
  rol: RolSchema.optional().nullable(),
  estado: z.boolean(),
  persona: PersonaSchema.optional(),
});
export const ApiUsuarioSchema = z.object({
  idUsuario: z.number(),
  gmail: z.string(),
  avatarUrl: z.string().nullable(),
  idRol: z.number(),
  rol: RolSchema.optional().nullable(),
  estado: z.boolean(),
  idPersona: z.number().optional(),
  persona: z.object({
    idPersona: z.number(),
    nombre: z.string(),
    apellido: z.string(),
    dni: z.number(),
    fechaNac: z.string(),
    estado: z.boolean(),
  }),
});

export const UsuarioApiParser = ApiUsuarioSchema.transform((data) => ({
  ...data,
  persona: {
    ...data.persona,
    fechaNac: new Date(data.persona.fechaNac),
  },
}));

export type ApiUsuarioType = z.infer<typeof ApiUsuarioSchema>;
export type UsuarioType = z.infer<typeof UsuarioSchema>;
export type RolType = z.infer<typeof RolSchema>;
export type PersonaType = z.infer<typeof PersonaSchema>;
