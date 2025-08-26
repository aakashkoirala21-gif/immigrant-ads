import { QueryInterface, DataTypes } from 'sequelize';

// The type for the context object in the 'up' function
interface MigrationContext {
  context: QueryInterface;
}

export async function up({ context: queryInterface }: MigrationContext): Promise<void> {
  // Add the new 'pending_amount' column to the 'payments' table
  await queryInterface.addColumn('payments', 'pending_amount', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  });
}

export async function down({ context: queryInterface }: MigrationContext): Promise<void> {
  // Remove the 'pending_amount' column if the migration is rolled back
  await queryInterface.removeColumn('payments', 'pending_amount');
}