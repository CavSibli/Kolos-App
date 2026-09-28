import { config } from 'dotenv';
import { resolve } from 'path';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import dataSource from '../postgres.data-source';
import { UserOrmEntity } from '../../../../modules/identity/infrastructure/typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from '../../../../modules/identity/infrastructure/typeorm/entities/role.orm-entity';

config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

async function seedAdminUser() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(UserOrmEntity);
  const roleRepo = dataSource.getRepository(RoleOrmEntity);

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'Admin1234!';

  const existing = await userRepo.findOne({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin user already exists, skipping seed.');
    await dataSource.destroy();
    return;
  }

  const adminRole = await roleRepo.findOneOrFail({ where: { name: 'admin' } });
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = userRepo.create({
    id: randomUUID(),
    email: adminEmail,
    passwordHash,
    firstName: 'Admin',
    lastName: 'Kolos',
    roles: [adminRole],
  });

  await userRepo.save(admin);
  console.log(`Admin user seeded: ${adminEmail}`);

  await dataSource.destroy();
}

seedAdminUser().catch((error) => {
  console.error(error);
  process.exit(1);
});
