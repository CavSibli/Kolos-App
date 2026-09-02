import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StatutVerificationOrmEntity } from '../../../../../shared/reference-data/infrastructure/typeorm/entities/statut-verification.orm-entity';

@Entity('profils_aidant')
export class ProfilAidantOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  @Column({ name: 'id_statut_verification' })
  statutVerificationId!: number;

  @ManyToOne(() => StatutVerificationOrmEntity)
  @JoinColumn({ name: 'id_statut_verification' })
  statutVerification!: StatutVerificationOrmEntity;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ name: 'rayon_intervention', type: 'int' })
  rayonIntervention!: number;

  @Column({ name: 'date_identite_verifiee', type: 'timestamptz', nullable: true })
  dateIdentiteVerifiee!: Date | null;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation!: Date;

  @UpdateDateColumn({ name: 'date_maj', type: 'timestamptz' })
  dateMaj!: Date;
}
