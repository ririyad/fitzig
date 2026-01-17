import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

// Log a completed session
export const logCompletedSession = mutation({
	args: {
		sessionId: v.id('sessions'),
		userId: v.id('users'),
		startedAt: v.number(),
		completedAt: v.number(),
		actualDuration: v.number(),
		exercisesCompleted: v.number()
	},
	handler: async (ctx, args) => {
		const logId = await ctx.db.insert('sessionLogs', {
			sessionId: args.sessionId,
			userId: args.userId,
			startedAt: args.startedAt,
			completedAt: args.completedAt,
			actualDuration: args.actualDuration,
			exercisesCompleted: args.exercisesCompleted
		});
		return logId;
	}
});

// Get session history for a user
export const getSessionHistory = query({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		const logs = await ctx.db
			.query('sessionLogs')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.order('desc')
			.collect();

		// Get session details for each log
		const logsWithSessions = await Promise.all(
			logs.map(async (log) => {
				const session = await ctx.db.get(log.sessionId);
				return {
					...log,
					session
				};
			})
		);

		return logsWithSessions;
	}
});

// Get aggregated stats for a user
export const getSessionStats = query({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		const logs = await ctx.db
			.query('sessionLogs')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.collect();

		const totalSessions = logs.length;
		const totalDuration = logs.reduce((sum, log) => sum + log.actualDuration, 0);
		const totalExercises = logs.reduce((sum, log) => sum + log.exercisesCompleted, 0);

		// Calculate this week's stats
		const now = Date.now();
		const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
		const thisWeekLogs = logs.filter((log) => log.completedAt >= oneWeekAgo);
		const thisWeekSessions = thisWeekLogs.length;
		const thisWeekDuration = thisWeekLogs.reduce((sum, log) => sum + log.actualDuration, 0);

		return {
			totalSessions,
			totalDuration,
			totalExercises,
			thisWeekSessions,
			thisWeekDuration
		};
	}
});

// Get logs for a specific session
export const getLogsForSession = query({
	args: { sessionId: v.id('sessions') },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('sessionLogs')
			.withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
			.order('desc')
			.collect();
	}
});
