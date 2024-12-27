import mongoose, { Schema } from "mongoose";

const RoleSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, required: false },
    },
    { timestamps: true, collection: "roles" },
);

const Role = mongoose.model("Role", RoleSchema);
export default Role;
