import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema({
	...authTables,

	// Exercises table (system + user-created)
	exercises: defineTable({
		name: v.string(),
		category: v.union(
			v.literal('strength'),
			v.literal('cardio'),
			v.literal('flexibility'),
			v.literal('custom')
		),
		description: v.string(),
		defaultDuration: v.number(), // in seconds
		isSystem: v.boolean(),
		createdBy: v.optional(v.id('users')) // null for system exercises
	})
		.index('by_category', ['category'])
		.index('by_creator', ['createdBy'])
		.index('by_system', ['isSystem']),

	// Sessions table
	sessions: defineTable({
		userId: v.id('users'),
		sessionName: v.string(),
		numberOfExercises: v.number(),
		totalDuration: v.number(), // in seconds
		status: v.union(v.literal('draft'), v.literal('ready'), v.literal('completed')),
		createdAt: v.number()
	})
		.index('by_user', ['userId'])
		.index('by_user_status', ['userId', 'status']),

	// Session Exercises (progression map)
	sessionExercises: defineTable({
		sessionId: v.id('sessions'),
		exerciseId: v.id('exercises'),
		order: v.number(),
		sets: v.number(),
		durationPerSet: v.number(), // in seconds
		restBetweenSets: v.number() // in seconds
	})
		.index('by_session', ['sessionId'])
		.index('by_session_order', ['sessionId', 'order']),

	// Session Logs (completed workout history)
	sessionLogs: defineTable({
		sessionId: v.id('sessions'),
		userId: v.id('users'),
		startedAt: v.number(),
		completedAt: v.number(),
		actualDuration: v.number(), // in seconds
		exercisesCompleted: v.number()
	})
		.index('by_user', ['userId'])
		.index('by_session', ['sessionId'])
		.index('by_user_date', ['userId', 'completedAt'])
});
