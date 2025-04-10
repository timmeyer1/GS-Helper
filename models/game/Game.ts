import mongoose, { Document, Schema } from 'mongoose';

// Interface pour une configuration de jeu
export interface IConfiguration {
  userId: mongoose.Types.ObjectId;
  name: string;
  cpu: string;
  gpu: string;
  ram: number;
  settings: Map<string, string>;
  focus: 'Performance' | 'Visuel';
  fps?: number;
  votes: number;
  createdAt: Date;
}

// Interface pour un jeu
export interface IGame extends Document {
  igdbId: number;
  name: string;
  slug: string;
  summary?: string;
  coverUrl?: string | null;
  releaseDate?: Date | null;
  genres: string[];
  platforms: string[];
  screenshots: string[];
  rating?: number | null;
  configurations: IConfiguration[];
  lastUpdated: Date;
  // Champ pour indiquer si c'est un jeu complet (pas un DLC)
  isFullGame: boolean;
  // Champ pour indiquer si c'est un remaster
  isRemaster: boolean;
}

// Définir le schéma pour une configuration de jeu
const ConfigurationSchema = new Schema<IConfiguration>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  cpu: {
    type: String,
    required: true
  },
  gpu: {
    type: String,
    required: true
  },
  ram: {
    type: Number,
    required: true
  },
  settings: {
    type: Map,
    of: String,
    required: true
  },
  focus: {
    type: String,
    enum: ['Performance', 'Visuel'],
    required: true
  },
  fps: {
    type: Number
  },
  votes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Définir le schéma pour un jeu
const GameSchema = new Schema<IGame>({
  igdbId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: ''
  },
  coverUrl: {
    type: String,
    default: null
  },
  releaseDate: {
    type: Date,
    default: null,
    // Permettre explicitement null pour éviter l'erreur de validation
    validate: {
      validator: function(v: any) {
        return v === null || v instanceof Date && !isNaN(v.getTime());
      },
      message: props => 'Date de sortie invalide'
    }
  },
  genres: {
    type: [String],
    default: []
  },
  platforms: {
    type: [String],
    default: []
  },
  screenshots: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: null
  },
  configurations: {
    type: [ConfigurationSchema],
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // Indique si c'est un jeu complet (pas un DLC)
  isFullGame: {
    type: Boolean,
    default: true
  },
  // Indique si c'est un remaster
  isRemaster: {
    type: Boolean,
    default: false
  }
});

// Indexer les champs pertinents pour améliorer les performances des requêtes
GameSchema.index({ name: 'text', slug: 'text' });
GameSchema.index({ igdbId: 1 });
GameSchema.index({ 'configurations.focus': 1 });
GameSchema.index({ 'configurations.votes': -1 });
GameSchema.index({ isFullGame: 1 });
GameSchema.index({ isRemaster: 1 });

// Créer le modèle seulement s'il n'existe pas déjà
export const Game = mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);