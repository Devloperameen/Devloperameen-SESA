import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    watchCount: number;
    totalMinutesWatched: number;
    lastWatchedAt: Date;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProgressSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    watchCount: { type: Number, default: 0 },
    totalMinutesWatched: { type: Number, default: 0 },
    lastWatchedAt: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Unique index: one progress record per user per course
ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

ProgressSchema.pre('save', function () {
    this.updatedAt = new Date();
});

export default mongoose.model<IProgress>('Progress', ProgressSchema);
