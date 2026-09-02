import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('statuts_demande')
export class StatutDemandeOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 40, unique: true })
  code!: string;

  @Column({ length: 100 })
  libelle!: string;
}
