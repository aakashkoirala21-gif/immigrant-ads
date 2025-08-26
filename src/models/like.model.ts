import {
  DataTypes,
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

export interface LikeModel extends Model<
  InferAttributes<LikeModel>,
  InferCreationAttributes<LikeModel>
> {
  id: CreationOptional<string>;
  post_id: string;
  user_id: string;
  created_at: CreationOptional<Date>;
}

export const defineLikeModel = (sequelize: Sequelize) => {
  return sequelize.define<LikeModel>('Like', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'community_posts',
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'likes',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['post_id', 'user_id'],
        name: 'unique_like_per_user_per_post',
      }
    ]
  });
};
