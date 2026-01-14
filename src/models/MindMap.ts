import mongoose, { Schema, Document } from "mongoose";

export interface IMindMapNode {
    id: string;
    label: string;
    type: "root" | "principle" | "law" | "category" | "detail";
    description?: string;
    x: number;
    y: number;
    color?: string;
}

export interface IMindMapConnection {
    from: string;
    to: string;
}

export interface IMindMap extends Document {
    title: string;
    slug: string;
    description?: string;
    nodes: IMindMapNode[];
    connections: IMindMapConnection[];
    createdAt: Date;
    updatedAt: Date;
}

const MindMapNodeSchema = new Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
        type: String,
        enum: ["root", "principle", "law", "category", "detail"],
        default: "detail"
    },
    description: { type: String },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    color: { type: String }
});

const MindMapConnectionSchema = new Schema({
    from: { type: String, required: true },
    to: { type: String, required: true }
});

const MindMapSchema: Schema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: { type: String },
        nodes: [MindMapNodeSchema],
        connections: [MindMapConnectionSchema]
    },
    {
        timestamps: true
    }
);

export default mongoose.models.MindMap || mongoose.model<IMindMap>("MindMap", MindMapSchema);
