<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ConvexAuthProvider } from '@convex-dev/auth/react';
	import { convexClient } from '$lib/convex/client';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ConvexAuthProvider client={convexClient}>
	{@render children()}
</ConvexAuthProvider>
