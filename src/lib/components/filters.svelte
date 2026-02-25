<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Checkbox from '$lib/components/checkbox.svelte';
	import {
		getShowsCinemas,
		getShowsDates,
		getShowsGenres,
		getShowsVersions
	} from '$lib/remotes/filters.remote';
	import type { ShowCinemas } from '$lib/utils/types';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import X from '@lucide/svelte/icons/x';

	interface Props {
		showGenres: boolean;
		datesToShow?: string[];
		resultCount?: number;
	}

	let { showGenres, datesToShow, resultCount }: Props = $props();

	let showsFilters = $derived.by(() => {
		const searchParams = page.url.searchParams;
		const date = searchParams.get('date');
		const cinemas = searchParams.get('cinemas');
		const versions = searchParams.get('versions');
		const genres = searchParams.get('genres');

		return {
			date: date ? new Date(date) : new Date(),
			cinemas: cinemas ? (cinemas.split(',').map(Number) as ShowCinemas[]) : [],
			versions: versions ? versions.split(',') : [],
			genres: genres ? genres.split(',').map(Number) : []
		};
	});

	const toggleFilter = (filter: 'cinemas' | 'versions' | 'genres', value: string | number) => {
		const currentValue = page.url.searchParams.get(filter);
		const params = new URLSearchParams(page.url.searchParams);
		if (currentValue) {
			let currentValueArray = currentValue.split(',');
			if (currentValueArray.includes(value.toString())) {
				currentValueArray = currentValueArray.filter((v) => v !== value.toString());
			} else {
				currentValueArray.push(value.toString());
			}
			if (currentValueArray.length === 0) {
				params.delete(filter);
			} else {
				params.set(filter, currentValueArray.join(','));
			}
		} else {
			params.set(filter, value.toString());
		}
		goto(`?${params.toString().replaceAll('%2C', ',')}`, { noScroll: true });
	};
</script>

<div class="filters">
	<button command="show-modal" commandfor="filters-dialog"
		><SlidersHorizontal size={16} strokeWidth={2.5} /></button
	>
	<div class="dates">
		{#each (await getShowsDates()).filter((date) => !datesToShow || datesToShow.includes(date
						.toISOString()
						.split('T')[0])) as date, i}
			{@const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]}
			{@const isTomorrow =
				date.toISOString().split('T')[0] ===
				new Date(Date.now() + 86400000).toISOString().split('T')[0]}

			<label>
				<input
					type="radio"
					name="date"
					checked={date.toISOString().split('T')[0] ===
						showsFilters.date.toISOString().split('T')[0]}
					onclick={() => {
						const params = new URLSearchParams(page.url.searchParams);
						params.set('date', date.toISOString().split('T')[0]);
						goto(`?${params.toString()}`, { noScroll: true });
					}}
				/>
				{#if isToday}
					<span>Aujourd'hui</span>
				{:else if isTomorrow}
					<span>Demain</span>
				{:else}
					<p>
						{date.toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' })}
					</p>
				{/if}
			</label>
		{/each}
	</div>
</div>

<dialog id="filters-dialog" closedby="any">
	<header>
		<h2>Filtres</h2>
		<button command="close" commandfor="filters-dialog"><X /></button>
	</header>
	<form method="dialog">
		<div class="global-filters">
			<div>
				<h3>Cinemas</h3>
				<div>
					{#each await getShowsCinemas() as { id, name }}
						<Checkbox
							text={name}
							name="cinema"
							checked={showsFilters.cinemas.includes(id)}
							onclick={() => toggleFilter('cinemas', id)}
						/>
					{/each}
				</div>
			</div>
			<div>
				<h3>Versions</h3>
				<div>
					{#each await getShowsVersions() as version}
						<Checkbox
							text={version}
							name="version"
							checked={showsFilters.versions.includes(version)}
							onclick={() => toggleFilter('versions', version)}
						/>
					{/each}
				</div>
			</div>
			{#if showGenres}
				<div>
					<h3>Genres</h3>
					<div>
						{#each await getShowsGenres() as { id, name }}
							<Checkbox
								text={name}
								name="genre"
								checked={showsFilters.genres.includes(id)}
								onclick={() => toggleFilter('genres', id)}
							/>
						{/each}
					</div>
				</div>
			{/if}
		</div>
		<div class="actions">
			<button class="btn btn--primary" type="submit"
				>{resultCount === 1
					? 'Afficher le résultat'
					: `Afficher les ${resultCount} résultats`}</button
			>
			<button
				class="btn btn--secondary"
				type="button"
				onclick={() => {
					const currentDate = showsFilters.date.toISOString().split('T')[0];
					goto(`?date=${currentDate}`, { noScroll: true });
				}}>Effacer les filtres</button
			>
		</div>
	</form>
</dialog>

<style lang="scss">
	@use '$lib/styles/vars.scss' as *;

	.filters {
		margin-top: 1rem;
		padding: 0 1rem;
		display: flex;
		gap: $spacing-sm;

		& > button {
			padding: 0.75rem 0.75rem;
			background: $bg-light;
			border: $border;
			border-radius: $radius-sm;
			display: flex;
			align-items: center;
			transition: 0.1s ease-in;

			&:hover {
				background: $bg-lighter;
			}
		}

		.dates {
			display: flex;
			gap: $spacing-sm;
			overflow-x: auto;
			user-select: none;

			&::-webkit-scrollbar {
				display: none;
			}

			label {
				flex: 0 0 auto;
				padding: 0.75rem 0.625rem;
				font-size: 0.875rem;
				background: $bg-light;
				border: $border;
				border-radius: $radius-sm;
				cursor: pointer;
				display: flex;
				align-items: center;
				transition: 0.1s ease-in;

				&:has(:checked) {
					border-color: #fff;
				}

				&:hover {
					background: $bg-lighter;
				}
			}
		}
	}
	#filters-dialog {
		max-height: 100svh;
		height: fit-content;
		width: 100%;
		overflow-y: scroll;
		padding: 1rem;
		background: $bg-light;
		border-radius: $radius-sm $radius-sm 0 0;
		position: fixed;
		bottom: 0;
		right: 0;

		&[open] {
			animation: step-in 0.25s ease-in-out;
		}

		@keyframes step-in {
			from {
				transform: translateY(100%);
			}
			to {
				transform: translateY(0);
			}
		}

		header {
			margin-bottom: 1.875rem;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}
		form {
			.global-filters {
				display: flex;
				flex-direction: column;
				gap: 1.5rem;

				& > div {
					h3 {
						margin-bottom: 0.5rem;
					}
					& > div {
						display: flex;
						flex-wrap: wrap;
						gap: $spacing-sm;
					}
				}
			}
			.actions {
				margin-top: 1.5rem;
				display: flex;
				flex-direction: column;
				gap: $spacing-sm;

				button {
					width: 100%;
				}
			}
		}
	}
</style>
