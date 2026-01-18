<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	interface LayoutData {
		isAuthenticated?: boolean;
	}

	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
