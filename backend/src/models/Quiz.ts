import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizQuestion {
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    options?: string[];
    correctAnswer?: string | string[];
    points: number;
    explanation?: string;
}

export interface IQuizAttempt {
    studentId: mongoose.Types.ObjectId;
    answers: {
        questionIndex: number;
        answer: string | string[];
        isCorrect?: boolean;
        pointsEarned: number;
    }[];
    score: number;
    totalPoints: number;
    percentage: number;
    startedAt: Date;
    completedAt?: Date;
    timeSpent?: number; // in seconds
}

export interface IQuiz extends Document {
    courseId: mongoose.Types.ObjectId;
    lessonId?: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    questions: IQuizQuestion[];
    timeLimit?: number; // in minutes
    passingScore: number; // percentage
    attempts: IQuizAttempt[];
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const QuizQuestionSchema = new Schema({
    question: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
        required: true 
    },
    options: [{ type: String }],
    correctAnswer: { type: Schema.Types.Mixed },
    points: { type: Number, required: true, default: 1 },
    explanation: { type: String }
});

const QuizAttemptSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{
        questionIndex: { type: Number, required: true },
        answer: { type: Schema.Types.Mixed, required: true },
        isCorrect: { type: Boolean },
        pointsEarned: { type: Number, default: 0 }
    }],
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    percentage: { type: Number, required: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    timeSpent: { type: Number }
});

const QuizSchema: Schema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    title: { type: String, required: true },
    description: { type: String },
    questions: [QuizQuestionSchema],
    timeLimit: { type: Number },
    passingScore: { type: Number, default: 70 },
    attempts: [QuizAttemptSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

QuizSchema.pre('save', function() {
    this.updatedAt = new Date();
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
