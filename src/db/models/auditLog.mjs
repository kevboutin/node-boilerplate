import mongoose, { Schema } from "mongoose";

const AuditLogSchema = new Schema(
    {
        entityId: { type: String, required: true },
        entityName: { type: String, required: true },
        action: { type: String, required: true },
        createdById: { type: String, required: true },
        createdByEmail: { type: String, required: true },
        timesstamp: { type: Date, required: true },
        values: { type: Schema.Types.Mixed, required: false },
    },
    { timestamps: true },
);

AuditLogSchema.index({ entityName: 1, action: 1 });

export default mongoose.model("AuditLog", AuditLogSchema);
