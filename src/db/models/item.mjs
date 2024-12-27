import mongoose, { Schema } from "mongoose";

const ItemSchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, required: false },
    },
    { timestamps: true, collection: "items" },
);

const Item = mongoose.model("Item", ItemSchema);
export default Item;
