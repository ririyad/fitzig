<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

	interface LayoutData {
		authState?: any;
	}

	let { children, data }: { children: any; data: LayoutData } = $props();

	$effect(() => {
		console.log('=== Layout Client Effect ===');
		console.log('Data from server:', data);
		console.log('Auth state:', data.authState);
	});

	setupConvexAuth({ getServerState: () => data.authState });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
