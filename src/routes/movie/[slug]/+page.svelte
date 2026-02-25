<script lang="ts">
	import { page } from '$app/state';
	import Filters from '$lib/components/filters.svelte';
	import Showtime from '$lib/components/showtime.svelte';
	import {
		getMovie,
		getMovieAllShowsDates,
		getMovieImdbRating,
		getMovieShowtimes
	} from '$lib/remotes/movie.remote';
	import { runtimeMinuteToHours } from '$lib/utils/movie';
	import type { ShowCinemas } from '$lib/utils/types';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Play from '@lucide/svelte/icons/play';
	import X from '@lucide/svelte/icons/x';

	let { params } = $props();

	let showsFilters = $derived.by(() => {
		const searchParams = page.url.searchParams;
		const date = searchParams.get('date');
		const cinemas = searchParams.get('cinemas');
		const versions = searchParams.get('versions');

		return {
			date: date ? new Date(date) : new Date(),
			cinemas: cinemas ? (cinemas.split(',').map(Number) as ShowCinemas[]) : [],
			versions: versions ? versions.split(',') : []
		};
	});

	let movie = $derived(await getMovie(params.slug));
	let showtimes = $derived(
		await getMovieShowtimes({
			uuid: movie.uuid,
			date: showsFilters.date,
			cinemas: showsFilters.cinemas,
			versions: showsFilters.versions
		})
	);

	let trailerIFrame = $state<HTMLIFrameElement>();

	const stopTrailerOnClose = () => {
		if (!trailerIFrame) return;
		trailerIFrame.src = trailerIFrame.src;
	};
</script>

<svelte:head>
	<title
		>{movie.title}
		{movie.releaseDate && `(${movie.releaseDate.getFullYear()})`} • Film et séances • CinésBW</title
	>
</svelte:head>

<div class="backdrop">
	<header class="header">
		<p class="logo">CinésBW</p>
	</header>
	<button command="show-modal" commandfor="trailer-modal">
		<img src={movie.backdrop ? movie.backdrop.medium : movie.poster?.medium} alt={movie.title} />
		<span class="play-btn"><Play size={12} fill="#a9abc2" color="#a9abc2" /></span>
	</button>
</div>

{#if movie.videos && movie.videos.length > 0}
	<dialog id="trailer-modal" closedby="any" onclose={stopTrailerOnClose}>
		<button command="close" commandfor="trailer-modal"><X /></button>
		<div class="content">
			<div class="video-wrap">
				<iframe
					bind:this={trailerIFrame}
					src="https://www.youtube.com/embed/{movie.videos[0].key}"
					title={movie.videos[0].name}
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerpolicy="strict-origin-when-cross-origin"
					allowfullscreen
				></iframe>
			</div>
			<p>{movie.videos[0].name}</p>
		</div>
	</dialog>
{/if}

<main>
	<a href="/{page.url.search}"> <ChevronLeft size={16} /> Retourner à la programmation</a>
	<header>
		<h1>{movie.title}</h1>
		<p>
			{[runtimeMinuteToHours(movie.runtime), movie.genres.join(', ')].filter(Boolean).join(' • ')}
		</p>
	</header>
	<div class="metadata">
		{#if movie.releaseDate}
			<p>
				Sortie le <strong
					>{movie.releaseDate.toLocaleDateString('fr-BE', {
						day: '2-digit',
						month: 'long',
						year: 'numeric'
					})}</strong
				>
			</p>
		{/if}
		{#if movie.originalLanguage}
			<p>Originalement en <strong>{movie.originalLanguage}</strong></p>
		{/if}
		{#if movie.imdbId}
			<svelte:boundary>
				{#snippet pending()}
					<p>Chargement de la note...</p>
				{/snippet}

				{@const imdbRatingData = await getMovieImdbRating(movie.imdbId)}
				{#if imdbRatingData}
					<p>
						Noté <strong>{imdbRatingData.imdbRating}/10</strong> sur IMDb ({imdbRatingData.imdbVotes}
						votes)
					</p>
				{/if}
			</svelte:boundary>
		{/if}
	</div>
	<div class="infos">
		{#if movie.directors && movie.directors.length > 0}
			<div>
				<h3>Realisateur{movie.directors.length > 1 ? 's' : ''}</h3>
				<p>{movie.directors.join(', ')}</p>
			</div>
		{/if}
		{#if movie.actors && movie.actors.length > 0}
			<div>
				<h3>Acteur{movie.actors.length > 1 ? 's' : ''}</h3>
				<p>{movie.actors.join(', ')}</p>
			</div>
		{/if}
		{#if movie.overview}
			<div>
				<h3>Synopsis</h3>
				<p>{movie.overview}</p>
			</div>
		{/if}
		{#if movie.imdbId}
			<a href={`https://www.imdb.com/title/${movie.imdbId}`} target="_blank"
				>Ouvrir avec IMDb <ChevronRight size={16} /></a
			>
		{/if}
	</div>
</main>

<Filters
	showGenres={false}
	datesToShow={await getMovieAllShowsDates(movie.uuid)}
	resultCount={showtimes.length}
/>

<div class="showtimes">
	{#if showtimes.length > 0}
		<ul>
			{#each showtimes as { dateTime, version, cinema }}
				<Showtime {dateTime} {version} cinemaName={cinema.name} cinemaWebsite={cinema.website} />
			{/each}
		</ul>
	{:else}
		<p>Aucune séance disponible.</p>
	{/if}
</div>

<style lang="scss">
	@use '$lib/styles/vars.scss' as *;

	.header {
		width: 100%;
		padding: 1rem;
		position: absolute;
		top: 0;
		left: 0;
		background: linear-gradient(rgba($bg, 0.65), rgba($bg, 0));

		.logo {
			font-size: 1.3rem;
		}
	}
	.backdrop {
		position: relative;
		width: fit-content;

		img {
			display: block;
		}

		.play-btn {
			display: inline-block;
			padding: 0.875rem 1.375rem;
			background: linear-gradient(rgba($bg, 0.5), rgba($bg, 0.5));
			border: $border;
			border-radius: $radius-sm;
			backdrop-filter: blur(16px);
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
		}
	}
	#trailer-modal {
		width: 100%;

		&::backdrop {
			background: rgba($bg, 0.8);
		}

		& > button {
			position: absolute;
			top: 1rem;
			right: 1rem;
		}

		.content {
			width: min(95vw, 1200px);
			position: fixed;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);

			.video-wrap {
				width: 100%;
				aspect-ratio: 16 / 9;
			}

			iframe {
				height: 100%;
				width: 100%;
				display: block;
			}
			& > p {
				padding: 1rem 0;
			}
		}
	}
	main {
		padding: 1rem;

		& > a {
			color: $fg-muted;
			font-size: 0.875rem;
			display: flex;
			align-items: center;
			gap: 0.25rem;
		}
		h1 {
			margin: 1rem 0 0.5rem;
			font-size: 1.5rem;
		}
		.metadata {
			margin-top: 1rem;
			color: $fg-muted;
			line-height: 1.4;

			strong {
				color: $fg;
			}
		}
		.infos {
			margin-top: 1.5rem;
			display: flex;
			flex-direction: column;
			gap: 1.5rem;
			color: $fg-muted;

			h3 {
				color: $fg;
				margin-bottom: 0.5rem;
			}
			a {
				color: $fg;
				font-size: 0.875rem;
				display: flex;
				align-items: center;
			}
		}
	}
	.showtimes {
		& > p {
			margin-top: 2rem;
			text-align: center;
		}
		ul {
			margin-top: 0.5rem;
			padding: 0 1rem;
			overflow-x: auto;
			user-select: none;
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
			gap: $spacing-sm;

			&::-webkit-scrollbar {
				display: none;
			}
		}
	}
</style>
