import {
  DataTypes,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

// Define the interface for the User model
export interface UserModel
  extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
  > {
  id: CreationOptional<string>;
  full_name: string;
  email: string;
  phone?: string | null;
  profile_picture_url?: string | null;
  password_hash: string;
  role: 'user' | 'professional' | 'admin';
  location?: string;
  reset_token?: string | null;
  reset_token_expiry?: Date | null;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

// Function to define the model
export const defineUserModel = (sequelize: Sequelize) => {
  return sequelize.define<UserModel>(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      profile_picture_url: {
        type: DataTypes.STRING,
        allowNull: true, 
        validate: {
          isUrl: true,
        },
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('user', 'professional', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },
      location: {
        type: DataTypes.STRING,
      },
      reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};
