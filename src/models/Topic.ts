import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface cho 1 bài học Triết MLN111
 */
export interface ITopic extends Document {
    title: string;
    slug: string;

    content: {
        coreConcept: string;
        keyPoints: string[];
        example: string;
        thoughtQuestion: string;
    };

    learningOutcome: string;

    category:
    | "nguyen-ly"
    | "quy-luat"
    | "pham-tru"
    | "co-ban"
    | "khac";

    customCategory?: string;
    prerequisites: mongoose.Types.ObjectId[];
    order: number;
    quizContent: {
        question: string;
        options: string[];
        correctAnswer: string;
        points: number;
    }[];

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema MongoDB
 */
const TopicSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        content: {
            coreConcept: {
                type: String,
                required: true
            },

            keyPoints: {
                type: [String],
                validate: {
                    validator: function (arr: string[]) {
                        return arr && arr.length > 0;
                    },
                    message: "Phải có ít nhất 1 luận điểm"
                }
            },

            example: {
                type: String,
                required: true
            },

            thoughtQuestion: {
                type: String,
                required: true
            }
        },

        learningOutcome: {
            type: String,
            required: true
        },

        category: {
            type: String,
            enum: ["nguyen-ly", "quy-luat", "pham-tru", "co-ban", "khac"],
            default: "co-ban"
        },

        customCategory: {
            type: String,
            trim: true,
            required: function (this: ITopic) {
                return this.category === "khac";
            }
        },
        prerequisites: [
            {
                type: Schema.Types.ObjectId,
                ref: "Topic"
            }
        ],
        order: {
            type: Number,
            default: 0
        },
        quizContent: [{
            question: { type: String, required: true },
            options: { type: [String], required: true },
            correctAnswer: { type: String, required: true },
            points: { type: Number, default: 100 }
        }]
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Topic ||
    mongoose.model<ITopic>("Topic", TopicSchema);
