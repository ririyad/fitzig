import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get exercises for a session
export const getSessionExercises = query({
	args: { sessionId: v.id('sessions') },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('sessionExercises')
			.withIndex('by_session_order', (q) => q.eq('sessionId', args.sessionId))
			.collect();
	}
});

// Add exercises to a session (batch)
export const addExercisesToSession = mutation({
	args: {
		sessionId: v.id('sessions'),
		exercises: v.array(
			v.object({
				exerciseId: v.id('exercises'),
				order: v.number(),
				sets: v.number(),
				durationPerSet: v.number(),
				restBetweenSets: v.number()
			})
		)
	},
	handler: async (ctx, args) => {
		const ids = [];
		for (const exercise of args.exercises) {
			const id = await ctx.db.insert('sessionExercises', {
				sessionId: args.sessionId,
				exerciseId: exercise.exerciseId,
				order: exercise.order,
				sets: exercise.sets,
				durationPerSet: exercise.durationPerSet,
				restBetweenSets: exercise.restBetweenSets
			});
			ids.push(id);
		}
		return ids;
	}
});

// Update a single exercise progression
export const updateExerciseProgression = mutation({
	args: {
		sessionExerciseId: v.id('sessionExercises'),
		sets: v.optional(v.number()),
		durationPerSet: v.optional(v.number()),
		restBetweenSets: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const { sessionExerciseId, ...updates } = args;
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([_, value]) => value !== undefined)
		);

		await ctx.db.patch(sessionExerciseId, filteredUpdates);
	}
});

// Reorder exercises in a session
export const reorderExercises = mutation({
	args: {
		sessionId: v.id('sessions'),
		exerciseOrders: v.array(
			v.object({
				sessionExerciseId: v.id('sessionExercises'),
				order: v.number()
			})
		)
	},
	handler: async (ctx, args) => {
		for (const item of args.exerciseOrders) {
			await ctx.db.patch(item.sessionExerciseId, {
				order: item.order
			});
		}
	}
});

// Remove an exercise from a session
export const removeExerciseFromSession = mutation({
	args: { sessionExerciseId: v.id('sessionExercises') },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.sessionExerciseId);
	}
});

// Clear all exercises from a session
export const clearSessionExercises = mutation({
	args: { sessionId: v.id('sessions') },
	handler: async (ctx, args) => {
		const exercises = await ctx.db
			.query('sessionExercises')
			.withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
			.collect();

		for (const exercise of exercises) {
			await ctx.db.delete(exercise._id);
		}
	}
});
