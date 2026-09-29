/**
 * Migrations prod sans CLI TypeORM (évite hang / prompts).
 * Lancé par infra/docker/api-entrypoint.sh
 */
import dataSource from './postgres.data-source';

async function main() {
  // #region agent log
  console.log(
    `DBG_KOLOS ${JSON.stringify({
      sessionId: '27b403',
      hypothesisId: 'H1',
      location: 'run-migrations.ts:start',
      message: 'migrate script start',
      data: {
        PORT: process.env.PORT ?? null,
        POSTGRES_PORT: process.env.POSTGRES_PORT ?? null,
        POSTGRES_HOST: process.env.POSTGRES_HOST ?? null,
      },
      timestamp: Date.now(),
    })}`,
  );
  // #endregion

  await dataSource.initialize();

  // #region agent log
  console.log(
    `DBG_KOLOS ${JSON.stringify({
      sessionId: '27b403',
      hypothesisId: 'H1',
      location: 'run-migrations.ts:connected',
      message: 'datasource initialized',
      data: { isInitialized: dataSource.isInitialized },
      timestamp: Date.now(),
    })}`,
  );
  // #endregion

  const executed = await dataSource.runMigrations({ transaction: 'each' });

  // #region agent log
  console.log(
    `DBG_KOLOS ${JSON.stringify({
      sessionId: '27b403',
      hypothesisId: 'H1',
      location: 'run-migrations.ts:done',
      message: 'migrations ok',
      data: {
        count: executed.length,
        names: executed.map((m) => m.name),
      },
      timestamp: Date.now(),
    })}`,
  );
  // #endregion

  await dataSource.destroy();
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  // #region agent log
  console.error(
    `DBG_KOLOS ${JSON.stringify({
      sessionId: '27b403',
      hypothesisId: 'H1',
      location: 'run-migrations.ts:error',
      message: 'migrations failed',
      data: { error: message },
      timestamp: Date.now(),
    })}`,
  );
  // #endregion
  console.error(err);
  process.exit(1);
});
