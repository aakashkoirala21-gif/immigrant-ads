import { QueryInterface, DataTypes } from 'sequelize';

// The type for the context object in the 'up' function
interface MigrationContext {
  context: QueryInterface;
}

export async function up({ context: queryInterface }: MigrationContext): Promise<void> {
  await Promise.all([
    // 1. Add the 'appointment_type' column
    queryInterface.addColumn('schedules', 'appointment_type', {
      type: DataTypes.INTEGER,
      allowNull: true,
    }),
    // 2. Add the 'symptoms' column
    queryInterface.addColumn('schedules', 'symptoms', {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    }),
    // 3. Add the 'documents' column
    queryInterface.addColumn('schedules', 'documents', {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    }),
    // 4. Add the 'final_report' column
    queryInterface.addColumn('schedules', 'final_report', {
      type: DataTypes.JSONB,
      allowNull: true,
    }),
    // 5. Change the 'status' column to add the 'completed' value
    queryInterface.changeColumn('schedules', 'status', {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    }),
  ]);
}

export async function down({ context: queryInterface }: MigrationContext): Promise<void> {
  await Promise.all([
    queryInterface.removeColumn('schedules', 'appointment_type'),
    queryInterface.removeColumn('schedules', 'symptoms'),
    queryInterface.removeColumn('schedules', 'documents'),
    queryInterface.removeColumn('schedules', 'final_report'),
    // Revert the 'status' column to its original definition
    queryInterface.changeColumn('schedules', 'status', {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    }),
  ]);
}