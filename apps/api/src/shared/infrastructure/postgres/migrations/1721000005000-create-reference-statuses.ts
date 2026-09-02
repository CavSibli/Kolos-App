import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReferenceStatuses1721000005000 implements MigrationInterface {
  name = 'CreateReferenceStatuses1721000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "statuts_verification" (
        "id" SERIAL PRIMARY KEY,
        "code" VARCHAR(40) NOT NULL UNIQUE,
        "libelle" VARCHAR(100) NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "statuts_demande" (
        "id" SERIAL PRIMARY KEY,
        "code" VARCHAR(40) NOT NULL UNIQUE,
        "libelle" VARCHAR(100) NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "statuts_candidature" (
        "id" SERIAL PRIMARY KEY,
        "code" VARCHAR(40) NOT NULL UNIQUE,
        "libelle" VARCHAR(100) NOT NULL
      )
    `);

    await queryRunner.query(`
      INSERT INTO "statuts_verification" ("code", "libelle") VALUES
        ('NOT_VERIFIED', 'Non vérifié'),
        ('PENDING', 'En attente'),
        ('VERIFIED', 'Vérifié'),
        ('REJECTED', 'Rejeté')
    `);

    await queryRunner.query(`
      INSERT INTO "statuts_demande" ("code", "libelle") VALUES
        ('DRAFT', 'Brouillon'),
        ('PUBLISHED', 'Publiée'),
        ('PARTIALLY_ASSIGNED', 'Partiellement assignée'),
        ('ASSIGNED', 'Assignée'),
        ('CANCELLED', 'Annulée'),
        ('EXPIRED', 'Expirée')
    `);

    await queryRunner.query(`
      INSERT INTO "statuts_candidature" ("code", "libelle") VALUES
        ('PENDING', 'En attente'),
        ('ACCEPTED', 'Acceptée'),
        ('REFUSED', 'Refusée'),
        ('WITHDRAWN', 'Retirée')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "statuts_candidature"`);
    await queryRunner.query(`DROP TABLE "statuts_demande"`);
    await queryRunner.query(`DROP TABLE "statuts_verification"`);
  }
}
