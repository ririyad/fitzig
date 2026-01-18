<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	interface LayoutData {
		isAuthenticated?: boolean;
		authCookie?: string;
	}

	let { children, data }: { children: any; data: LayoutData } = $props();

	$effect(() => {
		console.log('=== Layout Client Effect ===');
		console.log('Data from server:', data);
		console.log('Is authenticated:', data.isAuthenticated);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
