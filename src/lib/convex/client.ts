import { ConvexClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$env/static/public';

const convexClient = new ConvexClient(PUBLIC_CONVEX_URL || '');

export const convex = convexClient;
export { convexClient };
