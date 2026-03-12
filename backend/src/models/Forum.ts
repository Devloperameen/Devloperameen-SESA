import mongoose, { Schema, Document } from 'mongoose';

export interface IPost {
    user: mongoose.Types.ObjectId;
    userName: string;
    text: string;
    createdAt: Date;
}

export interface IForumThread extends Document {
    course: mongoose.Types.ObjectId;
    title: string;
    creator: mongoose.Types.ObjectId;
    posts: IPost[];
    isPinned: boolean;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ForumThreadSchema: Schema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    posts: [PostSchema],
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ForumThreadSchema.pre('save', function () {
    this.updatedAt = new Date();
});

export default mongoose.model<IForumThread>('ForumThread', ForumThreadSchema);
