import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('statuts_signalement')
export class StatutSignalementOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 40, unique: true })
  code!: string;

  @Column({ length: 100 })
  libelle!: string;
}
