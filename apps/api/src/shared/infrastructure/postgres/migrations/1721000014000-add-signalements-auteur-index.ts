import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * T21 — modification SQL argumentée : index auteur + date sur signalements.
 * Miroir docs : docs/sql/02-modification-index-signalements-auteur.sql
 */
export class AddSignalementsAuteurIndex1721000014000
  implements MigrationInterface
{
  name = 'AddSignalementsAuteurIndex1721000014000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_signalements_auteur_date"
        ON "signalements" ("id_auteur", "date_creation" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_signalements_auteur_date"
    `);
  }
}
