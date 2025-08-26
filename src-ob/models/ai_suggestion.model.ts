import {
  DataTypes,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

export interface AISuggestionModel extends Model<
  InferAttributes<AISuggestionModel>,
  InferCreationAttributes<AISuggestionModel>
> {
  id: string;
  user_id: string;
  suggested_ids: object; // JSON array
  category_id?: string;
  created_at: CreationOptional<Date>;
}

export const defineAISuggestionModel = (sequelize: Sequelize) => {
  return sequelize.define<AISuggestionModel>('AISuggestion', {
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
    suggested_ids: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Array of professional IDs suggested',
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'ai_suggestions',
    timestamps: false,
  });
};
