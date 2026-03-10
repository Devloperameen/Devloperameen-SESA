import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
    course: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    totalEnrollments: number;
    activeStudents: number;
    completionRate: number;
    averageProgress: number;
    totalRevenue: number;
    viewCount: number;
    rating: number;
    reviews: number;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AnalyticsSchema: Schema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalEnrollments: { type: Number, default: 0 },
    activeStudents: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageProgress: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

AnalyticsSchema.pre('save', function() {
    this.updatedAt = new Date();
});

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
