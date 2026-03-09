<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/app.scss';
	import { getLastScrapeDate } from '$lib/remotes/update.remote';
	import X from '@lucide/svelte/icons/x';
	import dayjs from 'dayjs';
	import 'dayjs/locale/fr';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';

	dayjs.extend(utc);
	dayjs.extend(timezone);
	dayjs.locale('fr');
	dayjs.tz.setDefault('Europe/Brussels');

	let { children } = $props();

	let lastScrapeDate = $derived(dayjs(await getLastScrapeDate()));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<dialog id="last-update-dialog" open>
	<div class="last-update">
		<p>
			Dernière mise à jour le {lastScrapeDate.format('D MMMM YYYY')}.
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
