import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignmentSubmission {
    studentId: mongoose.Types.ObjectId;
    files: {
        filename: string;
        url: string;
        type: string;
        size: number;
    }[];
    screenshots: {
        filename: string;
        url: string;
        caption?: string;
    }[];
    textSubmission?: string;
    submittedAt: Date;
    grade?: number;
    feedback?: string;
    gradedBy?: mongoose.Types.ObjectId;
    gradedAt?: Date;
    status: 'submitted' | 'graded' | 'returned' | 'late';
}

export interface IAssignment extends Document {
    courseId: mongoose.Types.ObjectId;
    lessonId?: mongoose.Types.ObjectId;
    title: string;
    description: string;
    instructions: string;
    dueDate?: Date;
    maxPoints: number;
    allowLateSubmission: boolean;
    latePenalty?: number; // percentage
    submissions: IAssignmentSubmission[];
    attachments?: {
        filename: string;
        url: string;
        type: string;
    }[];
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AssignmentSubmissionSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    files: [{
        filename: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: true },
        size: { type: Number, required: true }
    }],
    screenshots: [{
        filename: { type: String, required: true },
        url: { type: String, required: true },
        caption: { type: String }
    }],
    textSubmission: { type: String },
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number, min: 0 },
    feedback: { type: String },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    gradedAt: { type: Date },
    status: { 
        type: String, 
        enum: ['submitted', 'graded', 'returned', 'late'],
        default: 'submitted'
    }
});

const AssignmentSchema: Schema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructions: { type: String, required: true },
    dueDate: { type: Date },
    maxPoints: { type: Number, required: true, default: 100 },
    allowLateSubmission: { type: Boolean, default: true },
    latePenalty: { type: Number, default: 10 },
    submissions: [AssignmentSubmissionSchema],
    attachments: [{
        filename: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: true }
    }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

AssignmentSchema.pre('save', function() {
    this.updatedAt = new Date();
});

// Index for efficient queries
AssignmentSchema.index({ courseId: 1, createdAt: -1 });
AssignmentSchema.index({ 'submissions.studentId': 1 });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
