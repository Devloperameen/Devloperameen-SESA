import mongoose, { Schema, type Document } from 'mongoose';

export type AnnouncementTargetRole = 'student' | 'instructor' | 'both';

export interface IAnnouncement extends Document {
    message: string;
    targetRole: AnnouncementTargetRole;
    createdBy: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
    {
        message: { type: String, required: true, trim: true, maxlength: 500 },
        targetRole: {
            type: String,
            enum: ['student', 'instructor', 'both'],
            required: true,
            default: 'both',
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
