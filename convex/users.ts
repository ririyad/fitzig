import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

// Get user by ID
export const getUser = query({
	args: { userId: v.id('users') },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.userId);
	}
});

// Get user by email
export const getUserByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', args.email))
			.unique();
	}
});

// Create a new user
export const createUser = mutation({
	args: {
		email: v.string(),
		name: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await ctx.db.insert('users', {
			email: args.email,
			name: args.name,
			createdAt: Date.now(),
			preferences: {
				theme: 'light'
			}
		});
		return userId;
	}
});

// Update user profile
export const updateProfile = mutation({
	args: {
		userId: v.id('users'),
		name: v.string()
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.userId, {
			name: args.name
		});
	}
});

// Update user preferences
export const updatePreferences = mutation({
	args: {
		userId: v.id('users'),
		theme: v.union(v.literal('light'), v.literal('dark'))
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.userId, {
			preferences: {
				theme: args.theme
			}
		});
	}
});
