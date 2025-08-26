import { QueryInterface, DataTypes } from 'sequelize';

interface MigrationContext {
  context: QueryInterface;
}

export async function up({ context: queryInterface }: MigrationContext): Promise<void> {
  // Use Promise.all to remove columns concurrently
  await Promise.all([
    queryInterface.removeColumn('professionals', 'price_per_slot'),
    queryInterface.removeColumn('professionals', 'currency'),
    queryInterface.removeColumn('professionals', 'timezone'),
  ]);
}

export async function down({ context: queryInterface }: MigrationContext): Promise<void> {
  // The down function re-adds the columns for a rollback.
  await Promise.all([
    queryInterface.addColumn('professionals', 'price_per_slot', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    }),
    queryInterface.addColumn('professionals', 'currency', {
      type: DataTypes.STRING,
      allowNull: true,
    }),
    queryInterface.addColumn('professionals', 'timezone', {
      type: DataTypes.STRING,
      allowNull: true,
    }),
  ]);
}