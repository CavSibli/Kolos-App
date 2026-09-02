import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfilsAidant1721000006000 implements MigrationInterface {
  name = 'CreateProfilsAidant1721000006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "profils_aidant" (
        "id" SERIAL PRIMARY KEY,
        "user_id" UUID NOT NULL UNIQUE,
        "id_statut_verification" INTEGER NOT NULL,
        "bio" TEXT,
        "rayon_intervention" INTEGER NOT NULL,
        "date_identite_verifiee" TIMESTAMPTZ,
        "date_creation" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "date_maj" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "chk_profils_aidant_rayon_positif" CHECK ("rayon_intervention" > 0),
        CONSTRAINT "fk_profils_aidant_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_profils_aidant_verification" FOREIGN KEY ("id_statut_verification")
          REFERENCES "statuts_verification"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_profils_aidant_verification"
        ON "profils_aidant" ("id_statut_verification")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "profils_aidant"`);
  }
}
