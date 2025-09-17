import mongoose, { Document, Schema } from "mongoose";

export interface IErrorLog extends Document {
	service: string;
	level: string;
	message: string;
	stack?: string;
	url?: string;
	method?: string;
	ip?: string;
	userAgent?: string;
	userId?: string;
	statusCode?: number;
	metadata?: any;
	timestamp: Date;
	expiresAt: Date; // Add expiration field
}

const ErrorLogSchema: Schema = new Schema(
	{
		service: {
			type: String,
			required: true,
			index: true,
		},
		level: {
			type: String,
			required: true,
			enum: ["error", "warn", "info", "debug"],
			index: true,
		},
		message: {
			type: String,
			required: true,
		},
		stack: {
			type: String,
		},
		url: {
			type: String,
		},
		method: {
			type: String,
		},
		ip: {
			type: String,
		},
		userAgent: {
			type: String,
		},
		userId: {
			type: String,
			index: true,
		},
		statusCode: {
			type: Number,
			index: true,
		},
		metadata: {
			type: Schema.Types.Mixed,
			default: {},
		},
		timestamp: {
			type: Date,
			default: Date.now,
			index: true,
		},
		expiresAt: {
			type: Date,
			default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
			index: true,
			expires: 0, // TTL index will automatically delete documents when expiresAt is reached
		},
	},
	{
		timestamps: true,
	}
);

// Compound indexes for better query performance
ErrorLogSchema.index({ service: 1, level: 1, timestamp: -1 });
ErrorLogSchema.index({ timestamp: -1 });
ErrorLogSchema.index({ userId: 1, timestamp: -1 });

// TTL index for automatic expiration (complementary to the expiresAt field)
ErrorLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ErrorLog = mongoose.model<IErrorLog>("ErrorLog", ErrorLogSchema);
