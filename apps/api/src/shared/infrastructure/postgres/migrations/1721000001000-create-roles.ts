import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoles1721000001000 implements MigrationInterface {
  name = 'CreateRoles1721000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) NOT NULL UNIQUE
      )
    `);

    await queryRunner.query(`
      INSERT INTO "roles" ("name") VALUES
        ('demandeur'),
        ('aidant'),
        ('admin')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
