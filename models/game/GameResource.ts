import mongoose, { Document, Schema } from 'mongoose';

// Interface pour les ressources requises par un jeu
export interface IGameResource extends Document {
  game_id: mongoose.Types.ObjectId;
  level: number;         // 1-4 (1: faible, 4: très élevé)
  libelle: string;       // Description textuelle du niveau
}

// Définir le schéma pour les ressources de jeu
const GameResourceSchema = new Schema<IGameResource>({
  game_id: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  libelle: {
    type: String,
    required: true
  }
});

// Indexer pour améliorer les performances des requêtes
GameResourceSchema.index({ game_id: 1 });
GameResourceSchema.index({ level: 1 });

// Créer le modèle seulement s'il n'existe pas déjà
export const GameResource = mongoose.models.GameResource || mongoose.model<IGameResource>('GameResource', GameResourceSchema);

// Libellés standards pour chaque niveau
export const RESOURCE_LEVELS = {
  1: "Accessible",
  2: "Modéré",
  3: "Exigeant",
  4: "Très exigeant"
};