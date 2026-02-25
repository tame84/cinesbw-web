<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/app.scss';
	import { getLastScrapeDate } from '$lib/remotes/update.remote';
	import X from '@lucide/svelte/icons/x';

	let { children } = $props();

	let lastScrapeDate = $derived(await getLastScrapeDate());
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<dialog id="last-update-dialog" open>
	<div class="last-update">
		<p>
			Dernière mise à jour le {lastScrapeDate.toLocaleDateString('fr-BE', {
				day: '2-digit',
				month: 'long',
				year: 'numeric'
			})}.
		</p>
		<button command="close" commandfor="last-update-dialog"><X /></button>
	</div>
</dialog>

{@render children()}

<footer>
	<p>Réalisé par Dino Valentini</p>
</footer>

<style lang="scss">
	@use '$lib/styles/vars.scss' as *;

	.last-update {
		z-index: 100;
		padding: 1rem;
		font-size: 0.875rem;
		background: $bg-light;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	footer {
		margin-top: 5rem;
		padding: 1.5rem 1rem;
		color: $fg-muted;
		font-size: 0.875rem;
		border-top: $border;
		display: grid;
		place-items: center;
	}
</style>
