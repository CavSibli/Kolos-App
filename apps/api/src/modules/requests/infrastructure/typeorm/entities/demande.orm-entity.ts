import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StatutDemandeOrmEntity } from '../../../../../shared/reference-data/infrastructure/typeorm/entities/statut-demande.orm-entity';

@Entity('demandes')
export class DemandeOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'id_demandeur', type: 'uuid' })
  demandeurId!: string;

  @Column({ name: 'id_statut_demande' })
  statutDemandeId!: number;

  @ManyToOne(() => StatutDemandeOrmEntity)
  @JoinColumn({ name: 'id_statut_demande' })
  statutDemande!: StatutDemandeOrmEntity;

  @Column({ length: 150 })
  titre!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'contraintes_physiques', type: 'text', nullable: true })
  contraintesPhysiques!: string | null;

  @Column({ type: 'text' })
  adresse!: string;

  @Column({ type: 'numeric', precision: 9, scale: 6, nullable: true })
  latitude!: string | null;

  @Column({ type: 'numeric', precision: 9, scale: 6, nullable: true })
  longitude!: string | null;

  @Column({ name: 'date_mission', type: 'timestamptz' })
  dateMission!: Date;

  @Column({ name: 'duree_estimee', type: 'int' })
  dureeEstimee!: number;

  @Column({ name: 'nb_aidants_requis', type: 'int' })
  nbAidantsRequis!: number;

  @Column({
    name: 'budget_estime',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  budgetEstime!: string | null;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj', type: 'timestamptz' })
  dateMaj!: Date;

  @Column({ name: 'date_annulation', type: 'timestamptz', nullable: true })
  dateAnnulation!: Date | null;

  @Column({ name: 'motif_annulation', type: 'text', nullable: true })
  motifAnnulation!: string | null;
}
