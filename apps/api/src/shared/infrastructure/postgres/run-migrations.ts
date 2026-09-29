/**
 * Migrations prod sans CLI TypeORM.
 * Lancé par infra/docker/api-entrypoint.sh
 */
import dataSource from './postgres.data-source';

async function main() {
  await dataSource.initialize();
  const executed = await dataSource.runMigrations({ transaction: 'each' });
  console.log(
    `Migrations applied: ${executed.length}${executed.length ? ` (${executed.map((m) => m.name).join(', ')})` : ''}`,
  );
  await dataSource.destroy();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
