import {
  DataTypes,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

export interface PaymentModel extends Model<
  InferAttributes<PaymentModel>,
  InferCreationAttributes<PaymentModel>
> {
  // CHANGED: id is now CreationOptional for type safety on creation
  id: CreationOptional<string>;
  schedule_id: string;
  user_id: string;
  amount: number;
  // NEW: Added to match your reference payload
  pending_amount: number;
  currency: string;
  stripe_session_id: string;
  payment_status: 'pending' | 'success' | 'failed';
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

export const definePaymentModel = (sequelize: Sequelize) => {
  return sequelize.define<PaymentModel>('Payment', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    schedule_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'schedules',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // NEW: Added to match your reference payload
    pending_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD',
    },
    stripe_session_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
};