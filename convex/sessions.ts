import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

// List all sessions for a user
export const listUserSessions = query({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('sessions')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
			.order('desc')
			.collect();
	}
});

// List sessions by status
export const listSessionsByStatus = query({
	args: {
		userId: v.id('users'),
		status: v.union(v.literal('draft'), v.literal('ready'), v.literal('completed'))
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('sessions')
			.withIndex('by_user_status', (q) => q.eq('userId', args.userId).eq('status', args.status))
			.order('desc')
			.collect();
	}
});

// Get single session by ID
export const getSessionById = query({
	args: { sessionId: v.id('sessions') },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.sessionId);
	}
});

// Get session with all exercises (full details)
export const getSessionWithExercises = query({
	args: { sessionId: v.id('sessions') },
	handler: async (ctx, args) => {
		const session = await ctx.db.get(args.sessionId);
		if (!session) return null;

		const sessionExercises = await ctx.db
			.query('sessionExercises')
			.withIndex('by_session_order', (q) => q.eq('sessionId', args.sessionId))
			.collect();

		// Get exercise details for each session exercise
		const exercisesWithDetails = await Promise.all(
			sessionExercises.map(async (se) => {
				const exercise = await ctx.db.get(se.exerciseId);
				return {
					...se,
					exercise
				};
			})
		);

		return {
			...session,
			exercises: exercisesWithDetails
		};
	}
});

// Create a new session
export const createSession = mutation({
	args: {
		userId: v.id('users'),
		sessionName: v.string(),
		numberOfExercises: v.number(),
		totalDuration: v.number()
	},
	handler: async (ctx, args) => {
		const sessionId = await ctx.db.insert('sessions', {
			userId: args.userId,
			sessionName: args.sessionName,
			numberOfExercises: args.numberOfExercises,
			totalDuration: args.totalDuration,
			status: 'draft',
			createdAt: Date.now()
		});
		return sessionId;
	}
});

// Update session
export const updateSession = mutation({
	args: {
		sessionId: v.id('sessions'),
		sessionName: v.optional(v.string()),
		numberOfExercises: v.optional(v.number()),
		totalDuration: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const { sessionId, ...updates } = args;
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([_, value]) => value !== undefined)
		);

		await ctx.db.patch(sessionId, filteredUpdates);
	}
});

// Update session status
export const updateSessionStatus = mutation({
	args: {
		sessionId: v.id('sessions'),
		status: v.union(v.literal('draft'), v.literal('ready'), v.literal('completed'))
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.sessionId, {
			status: args.status
		});
	}
});

// Delete session and its exercises
export const deleteSession = mutation({
	args: { sessionId: v.id('sessions') },
	handler: async (ctx, args) => {
		// Delete all session exercises first
		const sessionExercises = await ctx.db
			.query('sessionExercises')
			.withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
			.collect();

		for (const se of sessionExercises) {
			await ctx.db.delete(se._id);
		}

		// Delete the session
		await ctx.db.delete(args.sessionId);
	}
});
