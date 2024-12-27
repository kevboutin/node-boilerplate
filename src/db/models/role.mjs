import mongoose, { Schema } from "mongoose";

const RoleSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, required: false },
    },
    { timestamps: true },
);

export default mongoose.model("Role", RoleSchema);
