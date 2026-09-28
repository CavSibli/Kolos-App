import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserBanFields1721000013000 implements MigrationInterface {
  name = 'AddUserBanFields1721000013000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "banned_at" TIMESTAMPTZ,
        ADD COLUMN "ban_until" TIMESTAMPTZ,
        ADD COLUMN "ban_reason" TEXT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN "ban_reason",
        DROP COLUMN "ban_until",
        DROP COLUMN "banned_at"
    `);
  }
}
