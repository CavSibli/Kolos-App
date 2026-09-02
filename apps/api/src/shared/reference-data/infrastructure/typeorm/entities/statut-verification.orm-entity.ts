import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('statuts_verification')
export class StatutVerificationOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 40, unique: true })
  code!: string;

  @Column({ length: 100 })
  libelle!: string;
}
