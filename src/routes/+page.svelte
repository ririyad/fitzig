<script lang="ts">
	let theme = $state<'light' | 'dark'>('light');

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
	}
</script>

<svelte:head>
	<title>FitZig - Personalized Fitness Tracker</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
	<div class="hero min-h-screen">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold text-primary">FitZig</h1>
				<p class="py-6 text-base-content">
					Your personalized fitness tracker. Create custom workout sessions, track your progress,
					and achieve your fitness goals.
				</p>
				<div class="flex gap-4 justify-center">
					<button class="btn btn-primary">Get Started</button>
					<button class="btn btn-outline" onclick={toggleTheme}>
						{theme === 'light' ? 'Dark Mode' : 'Light Mode'}
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
