import {
  DataTypes,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { UserModel } from './user.model';
import { ProfessionalModel } from './professional.model';

export interface ScheduleModel
  extends Model<
    InferAttributes<ScheduleModel>,
    InferCreationAttributes<ScheduleModel>
  > {
  id: CreationOptional<string>;
  user_id: string; // Patient
  professional_id: string; // Doctor
  start_time: Date;
  end_time: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'; // Added 'completed'
  google_meet_url?: string;
  // Added Fields
  symptoms?: string[];
  documents?: string[];
  final_report?: object;
  appointment_type?: number;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
  patient?: UserModel;
  professional?: ProfessionalModel;
}

export const defineScheduleModel = (sequelize: Sequelize) => {
  return sequelize.define<ScheduleModel>(
    'Schedule',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      professional_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'professionals',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      google_meet_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        // Sticking with ENUM is good practice. Map integer values in your code.
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      // NEW: Added based on appointment payload
      appointment_type: {
        type: DataTypes.INTEGER,
        allowNull: true, // Based on payload 'appointment_type': 0
      },
      symptoms: {
        // Use ARRAY of strings for multiple symptoms
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      documents: {
        // Use ARRAY of strings for multiple document URLs
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      final_report: {
        // JSONB is ideal for nested report data
        type: DataTypes.JSONB,
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
      tableName: 'schedules',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};
