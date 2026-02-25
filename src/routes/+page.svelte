<script lang="ts">
	import { page } from '$app/state';
	import Filters from '$lib/components/filters.svelte';
	import Showtime from '$lib/components/showtime.svelte';
	import { getShows } from '$lib/remotes/shows.remote';
	import { runtimeMinuteToHours } from '$lib/utils/movie';
	import type { ShowCinemas } from '$lib/utils/types';

	let showsDate = $derived.by(() => {
		const date = page.url.searchParams.get('date');
		if (date) {
			return new Date(date);
		} else {
			return new Date();
		}
	});
	let showsCinemas = $derived.by(() => {
		const cinemas = page.url.searchParams.get('cinemas');
		if (cinemas) {
			return cinemas.split(',').map(Number) as ShowCinemas[];
		} else {
			return [];
		}
	});
	let showsVersions = $derived.by(() => {
		const versions = page.url.searchParams.get('versions');
		if (versions) {
			return versions.split(',');
		} else {
			return [];
		}
	});
	let showsGenres = $derived.by(() => {
		const genres = page.url.searchParams.get('genres');
		if (genres) {
			return genres.split(',').map(Number);
		} else {
			return [];
		}
	});

	let showsPromise = $derived(
		getShows({
			date: showsDate,
			cinemas: showsCinemas,
			versions: showsVersions,
			genres: showsGenres
		})
	);
	let shows = $derived(await showsPromise);
</script>

<svelte:head>
	<title>CinésBW • Programmation des cinémas du Brabant wallon</title>
</svelte:head>

<header class="header">
	<h1 class="logo">CinésBW</h1>
</header>

<Filters showGenres={true} resultCount={shows.length} />

<main>
	<svelte:boundary>
		{#snippet pending()}
			<p>Chargement de la programmation...</p>
		{/snippet}
		{#if showsPromise.loading}
			<p>Chargement de la programmation...</p>
		{:else if shows.length === 0}
			<p>Aucun résultat n'a été trouvé.</p>
		{:else}
			<div class="shows">
				{#each shows as { movie, showtimes }}
					<article>
						<div>
							<a href="/movie/{movie.slug + page.url.search}">
								<header>
									<img class="poster" src={movie.poster?.small} alt={movie.title} />
									<div class="movie">
										<h2>{movie.title}</h2>
										<p class="metadata">
											{[runtimeMinuteToHours(movie.runtime), movie.genres.join(', ')]
												.filter(Boolean)
												.join(' • ')}
										</p>
										<p class="showtimesCount">{showtimes.length} séances</p>
									</div>
								</header>
							</a>
							<ul class="showtimes">
								{#each showtimes as { dateTime, version, cinema }}
									<Showtime
										{dateTime}
										{version}
										cinemaName={cinema.name}
										cinemaWebsite={cinema.website}
									/>
								{/each}
							</ul>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</svelte:boundary>
</main>

<style lang="scss">
	@use '$lib/styles/vars.scss' as *;

	.header {
		padding: 1rem;

		.logo {
			font-size: 1.3rem;
		}
	}
	main {
		margin-top: 2rem;
		padding: 0 1rem;

		& > p {
			text-align: center;
		}
	}
	.shows {
		display: flex;
		flex-direction: column;
		gap: 2rem;

		article {
			header {
				display: flex;
				gap: 1rem;

				.poster {
					height: fit-content;
					width: 100%;
					max-width: 65px;
				}
				.movie {
					display: flex;
					flex-direction: column;

					.metadata {
						margin: 0.5rem 0;
						color: $fg-muted;
						font-size: 0.875rem;
					}
					.showtimesCount {
						font-size: 0.875rem;
						margin: auto 0 0;
					}
				}
			}
		}
		.showtimes {
			margin-top: 0.5rem;
			overflow-x: auto;
			user-select: none;
			display: grid;
			grid-auto-flow: column;
			grid-auto-columns: 180px;
			gap: $spacing-sm;

			&::-webkit-scrollbar {
				display: none;
			}
		}
	}
</style>
