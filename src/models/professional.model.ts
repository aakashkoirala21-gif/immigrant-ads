// model.ts

import {
  DataTypes,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { UserModel } from './user.model';

// Interface for a single slot configuration object
export interface SlotConfiguration {
  currency: string;
  day_of_week: number[];
  end_date: string;
  price: string;
  recurrence: number;
  start_date: string;
  time_slots: number[];
  timezone: string;
  type: string;
}

export interface ProfessionalModel extends Model<
  InferAttributes<ProfessionalModel>,
  InferCreationAttributes<ProfessionalModel>
> {
  id: string;
  license_number: string;
  category_id: string;
  is_paid: boolean;
  approved: boolean;
  bio?: string;
  // Availability is now an array of SlotConfiguration
  availability?: SlotConfiguration[];
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
  User?: UserModel;
}

export const defineProfessionalModel = (sequelize: Sequelize) => {
  return sequelize.define<ProfessionalModel>(
    'Professional',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      license_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
      },
      bio: {
        type: DataTypes.TEXT,
      },
      availability: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      is_paid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: 'professionals',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};