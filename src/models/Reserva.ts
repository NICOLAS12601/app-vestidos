// ...existing code...
import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface ReservaAttributes {
  id: number;
  vestido_id: number;
  fecha_ini: string;
  fecha_out: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  status?: string | null; // 'active' | 'cancelled'
}

interface ReservaCreationAttributes
  extends Optional<ReservaAttributes, "id" | "customer_name" | "customer_email" | "customer_phone" | "status"> {}

class Reserva extends Model<ReservaAttributes, ReservaCreationAttributes> implements ReservaAttributes {
  public id!: number;
  public vestido_id!: number;
  public fecha_ini!: string;
  public fecha_out!: string;
  public customer_name?: string | null;
  public customer_email?: string | null;
  public customer_phone?: string | null;
  public status?: string | null;
}

/**
 * initModel: inicializa el modelo con la instancia Sequelize recibida.
 * Llamar desde src/models/index.ts -> initDb()
 */
export function initModel(sequelize: Sequelize) {
  Reserva.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      vestido_id: { type: DataTypes.INTEGER, allowNull: false },
      fecha_ini: { type: DataTypes.DATEONLY, allowNull: false },
      fecha_out: { type: DataTypes.DATEONLY, allowNull: false },
      customer_name: { type: DataTypes.STRING(255), allowNull: true },
      customer_email: { type: DataTypes.STRING(255), allowNull: true },
      customer_phone: { type: DataTypes.STRING(50), allowNull: true },
      status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "active" },
    },
    {
      sequelize,
      tableName: "reservas",
      timestamps: false, // mantener falso para evitar errores si la tabla no tiene createdAt/updatedAt
    }
  );

  return Reserva;
}

export default Reserva;