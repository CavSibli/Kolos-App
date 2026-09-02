import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('statuts_mission')
export class StatutMissionOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 40, unique: true })
  code!: string;

  @Column({ length: 100 })
  libelle!: string;
}
