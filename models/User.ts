import mongoose, { Document, Model, Schema } from 'mongoose';

interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // on met un "?" psq il peut se connecter avec les services
    isAdmin: boolean;
    id: string;
    // Configuration matérielle intégrée
    config: {
        gpu_id?: mongoose.Types.ObjectId;
        cpu_id?: mongoose.Types.ObjectId;
        ram_id?: mongoose.Types.ObjectId;
        screenresolution_id?: mongoose.Types.ObjectId;
    };
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    config: {
        gpu_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gpu',
            required: false,
        },
        cpu_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cpu',
            required: false,
        },
        ram_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ram',
            required: false,
        },
        screenresolution_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ScreenResolution',
            required: false,
        },
    }
}, {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;