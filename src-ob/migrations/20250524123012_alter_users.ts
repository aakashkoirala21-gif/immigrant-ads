import { DataTypes, QueryInterface } from 'sequelize';

export async function up({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.addColumn('users', 'profile_picture_url', {
    type: DataTypes.STRING,
    allowNull: true,
  });
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.removeColumn('users', 'profile_picture_url');
}
