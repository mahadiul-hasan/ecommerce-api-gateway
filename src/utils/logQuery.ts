import { ErrorLog } from "../models/ErrorLog";

export interface LogQueryOptions {
	service?: string;
	level?: string;
	userId?: string;
	statusCode?: number;
	startDate?: Date;
	endDate?: Date;
	page?: number;
	limit?: number;
}

export const queryLogs = async (options: LogQueryOptions) => {
	const {
		service,
		level,
		userId,
		statusCode,
		startDate,
		endDate,
		page = 1,
		limit = 50,
	} = options;

	const skip = (page - 1) * limit;

	// Build query
	const query: any = {};

	if (service) query.service = service;
	if (level) query.level = level;
	if (userId) query.userId = userId;
	if (statusCode) query.statusCode = statusCode;

	if (startDate || endDate) {
		query.timestamp = {};
		if (startDate) query.timestamp.$gte = startDate;
		if (endDate) query.timestamp.$lte = endDate;
	}

	const logs = await ErrorLog.find(query)
		.sort({ timestamp: -1 })
		.skip(skip)
		.limit(limit)
		.lean();

	const total = await ErrorLog.countDocuments(query);

	return {
		logs,
		pagination: {
			page,
			limit,
			total,
			pages: Math.ceil(total / limit),
		},
	};
};

export const getServices = async () => {
	return await ErrorLog.distinct("service");
};

export const getErrorStats = async (service?: string) => {
	const matchStage: any = {};
	if (service) matchStage.service = service;

	return await ErrorLog.aggregate([
		{ $match: matchStage },
		{
			$group: {
				_id: {
					service: "$service",
					level: "$level",
				},
				count: { $sum: 1 },
			},
		},
		{
			$group: {
				_id: "$_id.service",
				levels: {
					$push: {
						level: "$_id.level",
						count: "$count",
					},
				},
				total: { $sum: "$count" },
			},
		},
		{ $sort: { total: -1 } },
	]);
};
