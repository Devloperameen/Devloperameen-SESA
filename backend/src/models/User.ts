import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  // Admin Roles
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  CONTENT_MANAGER = 'content_manager',
  SUPPORT_STAFF = 'support_staff',
  
  // Instructor Roles
  INSTRUCTOR = 'instructor',
  ASSISTANT_INSTRUCTOR = 'assistant_instructor',
  GUEST_INSTRUCTOR = 'guest_instructor',
  
  // Student Roles
  STUDENT = 'student',
  PREMIUM_STUDENT = 'premium_student',
  TRIAL_STUDENT = 'trial_student',
  
  // Additional Roles
  REVIEWER = 'reviewer',
  ANALYST = 'analyst',
  FINANCE_MANAGER = 'finance_manager'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  permissions?: string[];
  isActive: boolean;
  profileImage?: string;
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  enrolledCourses: mongoose.Types.ObjectId[];
  completedCourses: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.STUDENT },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  profileImage: { type: String },
  bio: { type: String },
  phone: { type: String },
  address: { type: String },
  dateOfBirth: { type: Date },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  completedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function() {
  this.updatedAt = new Date();
});

export default mongoose.model<IUser>('User', UserSchema);
