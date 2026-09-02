import { BadRequestException } from '@nestjs/common';
import { Entity } from '@shared/kernel/domain/entity';
import type { DemandeStatusCode } from '@shared/reference-data/application/ports/status-lookup.port';

export interface RequestProps {
  id?: number;
  demandeurId: string;
  statusCode: DemandeStatusCode;
  titre: string;
  description: string;
  contraintesPhysiques: string | null;
  adresse: string;
  latitude: number | null;
  longitude: number | null;
  dateMission: Date;
  dureeEstimee: number;
  nbAidantsRequis: number;
  budgetEstime: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Request extends Entity<RequestProps> {
  static publish(props: {
    demandeurId: string;
    titre: string;
    description: string;
    contraintesPhysiques: string | null;
    adresse: string;
    latitude: number | null;
    longitude: number | null;
    dateMission: Date;
    dureeEstimee: number;
    nbAidantsRequis: number;
    budgetEstime: number | null;
    now: Date;
  }): Request {
    const titre = props.titre.trim();
    const description = props.description.trim();
    const adresse = props.adresse.trim();

    if (!titre || !description || !adresse) {
      throw new BadRequestException('Titre, description et adresse sont obligatoires');
    }

    if (props.dateMission <= props.now) {
      throw new BadRequestException('La date de mission doit être dans le futur');
    }

    if (props.dureeEstimee <= 0) {
      throw new BadRequestException('La durée estimée doit être positive');
    }

    if (props.nbAidantsRequis <= 0) {
      throw new BadRequestException('Le nombre d\'aidants requis doit être positif');
    }

    if (props.budgetEstime !== null && props.budgetEstime < 0) {
      throw new BadRequestException('Le budget estimé ne peut pas être négatif');
    }

    return new Request({
      demandeurId: props.demandeurId,
      statusCode: 'PUBLISHED',
      titre,
      description,
      contraintesPhysiques: props.contraintesPhysiques,
      adresse,
      latitude: props.latitude,
      longitude: props.longitude,
      dateMission: props.dateMission,
      dureeEstimee: props.dureeEstimee,
      nbAidantsRequis: props.nbAidantsRequis,
      budgetEstime: props.budgetEstime,
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  get id(): number | undefined {
    return this.getProps().id;
  }

  get demandeurId(): string {
    return this.getProps().demandeurId;
  }

  get statusCode(): DemandeStatusCode {
    return this.getProps().statusCode;
  }

  get titre(): string {
    return this.getProps().titre;
  }

  get description(): string {
    return this.getProps().description;
  }

  get contraintesPhysiques(): string | null {
    return this.getProps().contraintesPhysiques;
  }

  get adresse(): string {
    return this.getProps().adresse;
  }

  get latitude(): number | null {
    return this.getProps().latitude;
  }

  get longitude(): number | null {
    return this.getProps().longitude;
  }

  get dateMission(): Date {
    return this.getProps().dateMission;
  }

  get dureeEstimee(): number {
    return this.getProps().dureeEstimee;
  }

  get nbAidantsRequis(): number {
    return this.getProps().nbAidantsRequis;
  }

  get budgetEstime(): number | null {
    return this.getProps().budgetEstime;
  }

  get createdAt(): Date {
    return this.getProps().createdAt;
  }

  get updatedAt(): Date {
    return this.getProps().updatedAt;
  }
}
