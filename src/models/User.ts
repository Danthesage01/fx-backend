
// // ================================
// // src/models/User.ts - FIXED MODEL
// import mongoose, { Schema, Document, Types } from 'mongoose';
// import bcrypt from 'bcryptjs';

// export interface IUser {
//  _id: Types.ObjectId;
//  email: string;
//  password: string;
//  name: string;
//  createdAt: Date;
//  updatedAt: Date;
// }

// interface IUserDocument extends Omit<IUser, '_id'>, Document {
//  comparePassword(candidatePassword: string): Promise<boolean>;
// }

// const UserSchema = new Schema<IUserDocument>({
//  email: {
//   type: String,
//   required: [true, 'Email is required'],
//   unique: true,
//   lowercase: true,
//   trim: true,
//   match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
//  },
//  password: {
//   type: String,
//   required: [true, 'Password is required'],
//   minlength: [6, 'Password must be at least 6 characters long'],
//   select: false // Don't include password in queries by default
//  },
//  name: {
//   type: String,
//   required: [true, 'Name is required'],
//   trim: true,
//   maxlength: [50, 'Name cannot exceed 50 characters']
//  }
// }, {
//  timestamps: true,
//  toJSON: {
//   transform: function (doc, ret) {
//    ret._id = ret._id.toString();
//    delete ret.password;
//    delete ret.__v;
//    return ret;
//   }
//  }
// });


// // Index for performance
// UserSchema.index({ email: 1 });

// // Hash password before saving
// UserSchema.pre('save', async function (next) {
//  if (!this.isModified('password')) return next();

//  try {
//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
//  } catch (error) {
//   next(error as Error);
//  }
// });

// // Compare password method
// UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
//  try {
//   return await bcrypt.compare(candidatePassword, this.password);
//  } catch (error) {
//   throw new Error('Password comparison failed');
//  }
// };

// export const User = mongoose.model<IUserDocument>('User', UserSchema);



// src/models/user.model.ts - UPDATED WITH OAUTH SUPPORT
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
 email: string;
 password?: string; // Optional for OAuth users
 name: string;
 avatar?: string;

 // OAuth fields
 googleId?: string;
 provider: 'local' | 'google';
 isEmailVerified: boolean;

 // Timestamps
 createdAt: Date;
 updatedAt: Date;
 lastLoginAt?: Date;

 // Methods
 comparePassword(candidatePassword: string): Promise<boolean>;
 toJSON(): any;
}

const userSchema = new Schema<IUser>({
 email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  index: true
 },
 password: {
  type: String,
  required: function (this: IUser) {
   // Password required only for local auth
   return this.provider === 'local';
  },
  minlength: 6,
  select: false // Don't include in queries by default
 },
 name: {
  type: String,
  required: true,
  trim: true,
  maxlength: 50
 },
 avatar: {
  type: String,
  default: null
 },

 // OAuth fields
 googleId: {
  type: String,
  sparse: true, // Allows multiple null values
  index: true
 },
 provider: {
  type: String,
  enum: ['local', 'google'],
  default: 'local',
  required: true
 },
 isEmailVerified: {
  type: Boolean,
  default: function (this: IUser) {
   // Google users are pre-verified
   return this.provider === 'google';
  }
 },

 lastLoginAt: {
  type: Date,
  default: null
 }
}, {
 timestamps: true,
 versionKey: false
});

// Compound index for OAuth providers
userSchema.index({ provider: 1, googleId: 1 });

// Hash password before saving (only for local users)
userSchema.pre('save', async function (next) {
 if (!this.isModified('password') || !this.password) return next();

 const salt = await bcrypt.genSalt(12);
 this.password = await bcrypt.hash(this.password, salt);
 next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
 if (!this.password) return false;
 return bcrypt.compare(candidatePassword, this.password);
};

// Override toJSON to exclude sensitive fields
userSchema.methods.toJSON = function () {
 const userObject = this.toObject();
 delete userObject.password;
 delete userObject.googleId; // Don't expose OAuth IDs
 return userObject;
};

// Ensure unique email across all providers
userSchema.pre('save', async function (next) {
 if (!this.isModified('email')) return next();

 const existingUser = await mongoose.models.User.findOne({
  email: this.email,
  _id: { $ne: this._id }
 });

 if (existingUser) {
  throw new Error('Email already exists with different authentication method');
 }

 next();
});

export const User = mongoose.model<IUser>('User', userSchema);