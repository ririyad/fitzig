import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

// List all exercises (system + user's custom)
export const listExercises = query({
	args: { userId: v.optional(v.id('users')) },
	handler: async (ctx, args) => {
		// Get all system exercises
		const systemExercises = await ctx.db
			.query('exercises')
			.withIndex('by_system', (q) => q.eq('isSystem', true))
			.collect();

		// Get user's custom exercises if userId provided
		let userExercises: typeof systemExercises = [];
		if (args.userId) {
			userExercises = await ctx.db
				.query('exercises')
				.withIndex('by_creator', (q) => q.eq('createdBy', args.userId))
				.collect();
		}

		return [...systemExercises, ...userExercises];
	}
});

// List exercises by category
export const listExercisesByCategory = query({
	args: {
		category: v.union(
			v.literal('strength'),
			v.literal('cardio'),
			v.literal('flexibility'),
			v.literal('custom')
		)
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('exercises')
			.withIndex('by_category', (q) => q.eq('category', args.category))
			.collect();
	}
});

// Get single exercise by ID
export const getExerciseById = query({
	args: { exerciseId: v.id('exercises') },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.exerciseId);
	}
});

// Create a custom exercise
export const createExercise = mutation({
	args: {
		name: v.string(),
		category: v.union(
			v.literal('strength'),
			v.literal('cardio'),
			v.literal('flexibility'),
			v.literal('custom')
		),
		description: v.string(),
		defaultDuration: v.number(),
		createdBy: v.id('users')
	},
	handler: async (ctx, args) => {
		const exerciseId = await ctx.db.insert('exercises', {
			name: args.name,
			category: args.category,
			description: args.description,
			defaultDuration: args.defaultDuration,
			isSystem: false,
			createdBy: args.createdBy
		});
		return exerciseId;
	}
});

// Update a custom exercise (only owner can update)
export const updateExercise = mutation({
	args: {
		exerciseId: v.id('exercises'),
		userId: v.id('users'),
		name: v.string(),
		category: v.union(
			v.literal('strength'),
			v.literal('cardio'),
			v.literal('flexibility'),
			v.literal('custom')
		),
		description: v.string(),
		defaultDuration: v.number()
	},
	handler: async (ctx, args) => {
		const exercise = await ctx.db.get(args.exerciseId);
		if (!exercise) {
			throw new Error('Exercise not found');
		}
		if (exercise.isSystem) {
			throw new Error('Cannot update system exercises');
		}
		if (exercise.createdBy !== args.userId) {
			throw new Error('Not authorized to update this exercise');
		}

		await ctx.db.patch(args.exerciseId, {
			name: args.name,
			category: args.category,
			description: args.description,
			defaultDuration: args.defaultDuration
		});
	}
});

// Delete a custom exercise (only owner can delete)
export const deleteExercise = mutation({
	args: {
		exerciseId: v.id('exercises'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const exercise = await ctx.db.get(args.exerciseId);
		if (!exercise) {
			throw new Error('Exercise not found');
		}
		if (exercise.isSystem) {
			throw new Error('Cannot delete system exercises');
		}
		if (exercise.createdBy !== args.userId) {
			throw new Error('Not authorized to delete this exercise');
		}

		await ctx.db.delete(args.exerciseId);
	}
});
