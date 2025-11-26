import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface UsuarioAdminAttributes {
    id: number;
    username: string;
    password_hash: string;
    created_at?: Date;
    updated_at?: Date;
}

type UsuarioAdminCreationAttributes = Optional<UsuarioAdminAttributes, "id" | "created_at" | "updated_at">;

class UsuarioAdmin extends Model<UsuarioAdminAttributes, UsuarioAdminCreationAttributes> implements UsuarioAdminAttributes {
    public id!: number;
    public username!: string;
    public password_hash!: string;
    public created_at!: Date;
    public updated_at!: Date;
}

export function initModel(sequelize: Sequelize) {
    UsuarioAdmin.init(
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "id" },
            username: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: "username" },
            password_hash: { type: DataTypes.STRING(255), allowNull: false, field: "password_hash" },
            created_at: { type: DataTypes.DATE, allowNull: true, field: "created_at", defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, allowNull: true, field: "updated_at", defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            tableName: "usuarios_admin",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return UsuarioAdmin;
}

export default UsuarioAdmin;

