import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
    text: string;
    options: string[];
    correctAnswer: number; // Index of the correct option
    explanation?: string;
    type: 'multiple-choice' | 'true-false';
}

export interface IQuiz extends Document {
    course: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    questions: IQuestion[];
    timeLimit?: number; // In minutes
    passingScore: number;
    attemptsAllowed: number;
    createdAt: Date;
    updatedAt: Date;
}

const QuestionSchema = new Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String },
    type: { type: String, enum: ['multiple-choice', 'true-false'], default: 'multiple-choice' }
});

const QuizSchema: Schema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String },
    questions: [QuestionSchema],
    timeLimit: { type: Number, default: 30 },
    passingScore: { type: Number, default: 70 },
    attemptsAllowed: { type: Number, default: 3 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

QuizSchema.pre('save', function () {
    this.updatedAt = new Date();
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
