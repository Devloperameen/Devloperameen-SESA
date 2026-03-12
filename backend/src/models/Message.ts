import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId;
    text: string;
    courseId?: mongoose.Types.ObjectId; // Optional context
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

MessageSchema.pre('save', function () {
    this.updatedAt = new Date();
});

export default mongoose.model<IMessage>('Message', MessageSchema);
