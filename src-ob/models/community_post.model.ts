import {
  DataTypes,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

export interface CommunityPostModel extends Model<
  InferAttributes<CommunityPostModel>,
  InferCreationAttributes<CommunityPostModel>
> {
  id: CreationOptional<string>;
  user_id: string;
  title: string;
  content: string;
  category_id: CreationOptional<string>;
  created_at: CreationOptional<Date>;
  updated_at: CreationOptional<Date>;
}

export const defineCommunityPostModel = (sequelize: Sequelize) => {
  return sequelize.define<CommunityPostModel>('CommunityPost', {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'community_posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
};
