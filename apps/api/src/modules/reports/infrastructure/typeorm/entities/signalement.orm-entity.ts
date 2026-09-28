import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TypeSignalementOrmEntity } from '../../../../../shared/reference-data/infrastructure/typeorm/entities/type-signalement.orm-entity';
import { StatutSignalementOrmEntity } from '../../../../../shared/reference-data/infrastructure/typeorm/entities/statut-signalement.orm-entity';
import { PrioriteSignalementOrmEntity } from '../../../../../shared/reference-data/infrastructure/typeorm/entities/priorite-signalement.orm-entity';

@Entity('signalements')
export class SignalementOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'id_mission' })
  missionId!: number;

  @Column({ name: 'id_auteur', type: 'uuid' })
  auteurId!: string;

  @Column({ name: 'id_utilisateur_signale', type: 'uuid', nullable: true })
  utilisateurSignaleId!: string | null;

  @Column({ name: 'id_admin_traitant', type: 'uuid', nullable: true })
  adminTraitantId!: string | null;

  @Column({ name: 'id_type_signalement' })
  typeSignalementId!: number;

  @ManyToOne(() => TypeSignalementOrmEntity)
  @JoinColumn({ name: 'id_type_signalement' })
  typeSignalement!: TypeSignalementOrmEntity;

  @Column({ name: 'id_statut_signalement' })
  statutSignalementId!: number;

  @ManyToOne(() => StatutSignalementOrmEntity)
  @JoinColumn({ name: 'id_statut_signalement' })
  statutSignalement!: StatutSignalementOrmEntity;

  @Column({ name: 'id_priorite_signalement' })
  prioriteSignalementId!: number;

  @ManyToOne(() => PrioriteSignalementOrmEntity)
  @JoinColumn({ name: 'id_priorite_signalement' })
  prioriteSignalement!: PrioriteSignalementOrmEntity;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  resolution!: string | null;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj', type: 'timestamptz' })
  dateMaj!: Date;

  @Column({ name: 'date_resolution', type: 'timestamptz', nullable: true })
  dateResolution!: Date | null;
}
