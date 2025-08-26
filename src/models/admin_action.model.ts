import {
  DataTypes,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

export interface AdminActionModel extends Model<
  InferAttributes<AdminActionModel>,
  InferCreationAttributes<AdminActionModel>
> {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id?: string;
  created_at: CreationOptional<Date>;
}

export const defineAdminActionModel = (sequelize: Sequelize) => {
  return sequelize.define<AdminActionModel>('AdminAction', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    target_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g. user, post, professional',
    },
    target_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'admin_actions',
    timestamps: false,
  });
};
