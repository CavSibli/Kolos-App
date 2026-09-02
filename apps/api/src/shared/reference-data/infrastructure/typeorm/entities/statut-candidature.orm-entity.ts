import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('statuts_candidature')
export class StatutCandidatureOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 40, unique: true })
  code!: string;

  @Column({ length: 100 })
  libelle!: string;
}
