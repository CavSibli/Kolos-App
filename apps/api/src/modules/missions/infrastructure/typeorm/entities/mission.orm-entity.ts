import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StatutMissionOrmEntity } from '../../../../../shared/reference-data/infrastructure/typeorm/entities/statut-mission.orm-entity';

@Entity('missions')
export class MissionOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'id_demande', unique: true })
  demandeId!: number;

  @Column({ name: 'id_statut_mission' })
  statutMissionId!: number;

  @ManyToOne(() => StatutMissionOrmEntity)
  @JoinColumn({ name: 'id_statut_mission' })
  statutMission!: StatutMissionOrmEntity;

  @Column({ name: 'date_debut', type: 'timestamptz', nullable: true })
  dateDebut!: Date | null;

  @Column({ name: 'date_fin', type: 'timestamptz', nullable: true })
  dateFin!: Date | null;

  @Column({
    name: 'montant_total',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  montantTotal!: string;

  @Column({ name: 'raison_annulation', type: 'text', nullable: true })
  raisonAnnulation!: string | null;

  @Column({ name: 'date_confirmation_demandeur', type: 'timestamptz', nullable: true })
  dateConfirmationDemandeur!: Date | null;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj', type: 'timestamptz' })
  dateMaj!: Date;
}
