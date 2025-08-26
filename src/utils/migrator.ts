import { Umzug, SequelizeStorage } from 'umzug';
import sequelize from '../config/db';

export const migrator = new Umzug({
  migrations: {
    glob: 'src/migrations/*.ts',
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export type Migration = typeof migrator._types.migration;
