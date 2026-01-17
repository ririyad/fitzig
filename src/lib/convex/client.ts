import { ConvexClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$env/static/public';

// Create Convex client - will throw if PUBLIC_CONVEX_URL is not set
if (!PUBLIC_CONVEX_URL) {
	console.warn('PUBLIC_CONVEX_URL is not set. Run `npx convex dev` to get your Convex URL.');
}

export const convex = new ConvexClient(PUBLIC_CONVEX_URL || '');
