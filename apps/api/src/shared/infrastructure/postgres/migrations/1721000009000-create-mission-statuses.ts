import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMissionStatuses1721000009000 implements MigrationInterface {
  name = 'CreateMissionStatuses1721000009000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "statuts_mission" (
        "id" SERIAL PRIMARY KEY,
        "code" VARCHAR(40) NOT NULL UNIQUE,
        "libelle" VARCHAR(100) NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "statuts_participation" (
        "id" SERIAL PRIMARY KEY,
        "code" VARCHAR(40) NOT NULL UNIQUE,
        "libelle" VARCHAR(100) NOT NULL
      )
    `);

    await queryRunner.query(`
      INSERT INTO "statuts_mission" ("code", "libelle") VALUES
        ('AWAITING_PAYMENT', 'En attente de paiement'),
        ('CONFIRMED', 'Confirmée'),
        ('AWAITING_CONFIRMATION', 'En attente de confirmation'),
        ('COMPLETED', 'Terminée'),
        ('DISPUTED', 'Litige'),
        ('CANCELLED', 'Annulée')
    `);

    await queryRunner.query(`
      INSERT INTO "statuts_participation" ("code", "libelle") VALUES
        ('SELECTED', 'Sélectionné'),
        ('COMPLETED', 'Terminée'),
        ('CANCELLED', 'Annulée')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "statuts_participation"`);
    await queryRunner.query(`DROP TABLE "statuts_mission"`);
  }
}
