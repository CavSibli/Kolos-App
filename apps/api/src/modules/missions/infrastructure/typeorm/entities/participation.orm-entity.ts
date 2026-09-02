import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StatutParticipationOrmEntity } from '../../../../../shared/reference-data/infrastructure/typeorm/entities/statut-participation.orm-entity';

@Entity('participations_mission')
export class ParticipationOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'id_mission' })
  missionId!: number;

  @Column({ name: 'id_aidant', type: 'uuid' })
  aidantId!: string;

  @Column({ name: 'id_candidature', unique: true })
  candidatureId!: number;

  @Column({ name: 'id_statut_participation' })
  statutParticipationId!: number;

  @ManyToOne(() => StatutParticipationOrmEntity)
  @JoinColumn({ name: 'id_statut_participation' })
  statutParticipation!: StatutParticipationOrmEntity;

  @Column({
    name: 'montant_convenu',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  montantConvenu!: string;

  @Column({ name: 'date_acceptation', type: 'timestamptz' })
  dateAcceptation!: Date;

  @Column({ name: 'date_debut', type: 'timestamptz', nullable: true })
  dateDebut!: Date | null;

  @Column({ name: 'date_fin', type: 'timestamptz', nullable: true })
  dateFin!: Date | null;

  @Column({ name: 'date_completion', type: 'timestamptz', nullable: true })
  dateCompletion!: Date | null;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj', type: 'timestamptz' })
  dateMaj!: Date;
}
