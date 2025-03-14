import mongoose, { Document, Model, Schema } from 'mongoose';

interface IUser extends Document {
    username: string;
    email: string;
    password?: string; // on met un "?" psq il peut se connecter avec les services
    id: string;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
    username: {
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
        require: false,
    },
})

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;