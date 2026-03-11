import mongoose, { Schema, type Document } from 'mongoose';

export type NotificationType =
    | 'enrollment_approved'
    | 'enrollment_rejected'
    | 'enrollment_pending'
    | 'course_published'
    | 'course_approved'
    | 'course_rejected'
    | 'payment_verified'
    | 'payment_rejected'
    | 'announcement'
    | 'system';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    link?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: [
                'enrollment_approved',
                'enrollment_rejected',
                'enrollment_pending',
                'course_published',
                'course_approved',
                'course_rejected',
                'payment_verified',
                'payment_rejected',
                'announcement',
                'system',
            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        link: {
            type: String,
            trim: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient user notification queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

// Auto-expire notifications after 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const createNotification = async (data: {
    userId: string | mongoose.Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
}): Promise<INotification> => {
    const notification = new Notification({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata,
    });
    return notification.save();
};

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
