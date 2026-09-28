import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('types_signalement')
export class TypeSignalementOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 40, unique: true })
  code!: string;

  @Column({ length: 100 })
  libelle!: string;
}
