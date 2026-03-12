import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
    course: mongoose.Types.ObjectId;
    title: string;
    description: string;
    resourceUrls?: string[]; // Links to helpful materials
    deadline?: Date;
    maxScore: number;
    instructions?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    resourceUrls: [{ type: String }],
    deadline: { type: Date },
    maxScore: { type: Number, default: 100 },
    instructions: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

AssignmentSchema.pre('save', function () {
    this.updatedAt = new Date();
});

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
