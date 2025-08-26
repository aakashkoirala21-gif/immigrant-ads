import { DataTypes, QueryInterface } from 'sequelize';

export async function up({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.addColumn('users', 'reset_token', {
    type: DataTypes.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn('users', 'reset_token_expiry', {
    type: DataTypes.DATE,
    allowNull: true,
  });
}

export async function down({ context: queryInterface }: { context: QueryInterface }) {
  await queryInterface.removeColumn('users', 'reset_token');
  await queryInterface.removeColumn('users', 'reset_token_expiry');
}
