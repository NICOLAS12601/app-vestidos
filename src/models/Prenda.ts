// ...existing code...
import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface PrendaAttributes {
    id: number;
    nombre?: string;
    color?: string;
    estilo?: string;
    talle?: string | null; // JSON string o CSV según tu diseño
    precio: number;
    imagen?: string | null; // URL de la imagen
}

type PrendaCreationAttributes = Optional<PrendaAttributes, "id">;

class Prenda extends Model<PrendaAttributes, PrendaCreationAttributes> implements PrendaAttributes {
    public id!: number;
    public nombre?: string;
    public color?: string;
    public estilo?: string;
    public talle?: string | null;
    public precio!: number;
    public imagen?: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

/**
 * initModel: inicializa el modelo con la instancia Sequelize recibida.
 * Llamar desde src/models/index.ts -> initDb()
 */
export function initModel(sequelize: Sequelize) {
    Prenda.init(
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "id" },
            nombre: { type: DataTypes.STRING, allowNull: true, field: "nombre" },
            color: { type: DataTypes.STRING, allowNull: true, field: "color" },
            estilo: { type: DataTypes.STRING, allowNull: true, field: "estilo" },
            talle: { type: DataTypes.TEXT, allowNull: true, field: "talle" },
            precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "precio" },
            imagen: { type: DataTypes.STRING, allowNull: true, field: "imagen" },
        },
        {
            sequelize,
            tableName: "prendas",
            timestamps: false,

        }
    );

    return Prenda;
}

export default Prenda;
// ...existing code...