// ...existing code...
import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface ReservaAttributes {
  reservas_id: number;
  vestido_id: number;
  fecha_ini: string;
  fecha_out: string;
 
}

interface ReservaCreationAttributes extends Optional<ReservaAttributes, "reservas_id" > {}

class Reserva extends Model<ReservaAttributes, ReservaCreationAttributes> implements ReservaAttributes {
  public reservas_id!: number;
  public vestido_id!: number;
  public fecha_ini!: string;
  public fecha_out!: string;
  
}

/**
 * initModel: inicializa el modelo con la instancia Sequelize recibida.
 * Llamar desde src/models/index.ts -> initDb()
 */
export function initModel(sequelize: Sequelize) {
  Reserva.init(
    {
      reservas_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      vestido_id: { type: DataTypes.INTEGER, allowNull: false },
      fecha_ini: { type: DataTypes.DATEONLY, allowNull: false },
      fecha_out: { type: DataTypes.DATEONLY, allowNull: false },
    
    },
    { sequelize, tableName: "reservas", timestamps: false }
  );

  return Reserva;
}

export default Reserva;
// ...existing code...