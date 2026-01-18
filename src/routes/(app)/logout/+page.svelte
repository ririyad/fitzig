<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		window.location.href = '/login';
	});
</script>

<div class="flex items-center justify-center min-h-screen">
	<p>Logging you out...</p>
</div>
