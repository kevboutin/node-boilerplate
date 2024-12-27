import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        roles: { type: Array, required: false },
        locale: { type: String, required: false },
        timezone: { type: String, required: false },
        verifiedEmail: { type: Boolean, default: false },
    },
    { timestamps: true },
);

export default mongoose.model("User", UserSchema);
