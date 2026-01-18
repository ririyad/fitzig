<script lang="ts">
	let { data } = $props();

	console.log('=== Debug Page ===');
	console.log('Load data:', data);
</script>

<div class="p-8">
	<h1 class="text-2xl font-bold mb-4">Debug Page</h1>

	<div class="space-y-4">
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">Authentication Status</h2>
				{#if data.isAuthenticated}
					<div class="alert alert-success">
						<span>✓ Authenticated</span>
					</div>
				{:else}
					<div class="alert alert-info">
						<span>✗ Not Authenticated</span>
					</div>
				{/if}
				<div class="mt-4">
					<p class="font-bold">Auth Cookie:</p>
					<pre class="bg-base-300 p-4 rounded overflow-auto text-xs">{data.authCookie || '(no cookie)'}</pre>
				</div>
			</div>
		</div>

		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">Load Function Data</h2>
				<pre class="bg-base-300 p-4 rounded overflow-auto">{JSON.stringify(data, null, 2)}</pre>
			</div>
		</div>

		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">Environment</h2>
				<ul class="list-disc list-inside">
					<li>Mode: {import.meta.env.MODE || 'unknown'}</li>
					<li>Browser: {typeof window !== 'undefined' ? 'browser' : 'server'}</li>
					<li>Timestamp: {new Date().toISOString()}</li>
				</ul>
			</div>
		</div>

		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">Navigation</h2>
				<ul class="list-disc list-inside space-y-2">
					<li><a href="/" class="link">Home</a></li>
					<li><a href="/login" class="link">Login</a></li>
					<li><a href="/register" class="link">Register</a></li>
					<li><a href="/dashboard" class="link">Dashboard (Protected)</a></li>
					<li><a href="/logout" class="link">Logout</a></li>
				</ul>
			</div>
		</div>
	</div>
</div>

<style>
	pre {
		max-height: 300px;
	}
</style>
