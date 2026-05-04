import { z } from "zod";

export const ListadoKilometrajeSchema = z.object({
  idRegistroKilometraje: z.number(),
  idVehiculo: z.number(),
  kilometraje: z.number(),
  fechaRegistro: z.string(),
  estado: z.boolean(),
  marca: z.string(),
  modelo: z.string(),
  patente: z.string(),
});

export type ListadoKilometrajeType = {
  IdControlKilometraje: number;
  IdVehiculo: number;
  Kilometraje: number;
  FechaRegistro: Date;
  Estado: boolean;
  Marca: string;
  Modelo: string;
  Patente: string;
};

export const ListadoKilometrajeApiParser = ListadoKilometrajeSchema.transform(
  (apiData) => ({
    IdControlKilometraje: apiData.idRegistroKilometraje,
    IdVehiculo: apiData.idVehiculo,
    Kilometraje: apiData.kilometraje,
    FechaRegistro: new Date(apiData.fechaRegistro),
    Estado: apiData.estado,
    Marca: apiData.marca,
    Modelo: apiData.modelo,
    Patente: apiData.patente,
  }),
);
