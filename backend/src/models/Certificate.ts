import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    certificateNumber: string;
    issuedDate: Date;
    expiryDate?: Date;
    grade?: string;
    certificateUrl?: string;
    createdAt: Date;
}

const CertificateSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    certificateNumber: { type: String, required: true, unique: true },
    issuedDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    grade: { type: String },
    certificateUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

CertificateSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model<ICertificate>('Certificate', CertificateSchema);
