import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('priorites_signalement')
export class PrioriteSignalementOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 40, unique: true })
  code!: string;

  @Column({ length: 100 })
  libelle!: string;

  @Column({ type: 'int', default: 0 })
  ordre!: number;
}
