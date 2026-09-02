import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StatutCandidatureOrmEntity } from '../../../../../shared/reference-data/infrastructure/typeorm/entities/statut-candidature.orm-entity';

@Entity('candidatures')
export class CandidatureOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'id_demande' })
  demandeId!: number;

  @Column({ name: 'id_aidant', type: 'uuid' })
  aidantId!: string;

  @Column({ name: 'id_statut_candidature' })
  statutCandidatureId!: number;

  @ManyToOne(() => StatutCandidatureOrmEntity)
  @JoinColumn({ name: 'id_statut_candidature' })
  statutCandidature!: StatutCandidatureOrmEntity;

  @Column({ type: 'text', nullable: true })
  message!: string | null;

  @Column({
    name: 'prix_propose',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  prixPropose!: string | null;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj', type: 'timestamptz' })
  dateMaj!: Date;

  @Column({ name: 'date_retrait', type: 'timestamptz', nullable: true })
  dateRetrait!: Date | null;
}
