import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { auth } from './auth';

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await auth.getUserId(ctx);
		if (userId === null) {
			return null;
		}
		return await ctx.db.get(userId);
	}
});

// Update user profile
export const updateProfile = mutation({
	args: {
		name: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await auth.getUserId(ctx);
		if (userId === null) {
			throw new Error('Not signed in');
		}
		await ctx.db.patch(userId, {
			name: args.name
		});
	}
});
