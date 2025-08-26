import { QueryInterface, DataTypes } from 'sequelize';

// The type for the context object in the 'up' function
interface MigrationContext {
  context: QueryInterface;
}

export async function up({ context: queryInterface }: MigrationContext): Promise<void> {
  // Use Promise.all to run both column additions concurrently
  await Promise.all([
    queryInterface.addColumn('professionals', 'currency', {
      type: DataTypes.STRING,
      allowNull: true, // Matches the model definition
    }),
    queryInterface.addColumn('professionals', 'timezone', {
      type: DataTypes.STRING,
      allowNull: true, // Matches the model definition
    }),
  ]);
}

export async function down({ context: queryInterface }: MigrationContext): Promise<void> {
  // Use Promise.all to run both column removals concurrently
  await Promise.all([
    queryInterface.removeColumn('professionals', 'currency'),
    queryInterface.removeColumn('professionals', 'timezone'),
  ]);
}