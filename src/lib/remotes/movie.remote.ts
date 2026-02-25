import { getRequestEvent, query } from '$app/server';
import { OMDB_API_KEY } from '$env/static/private';
import { db } from '$lib/server/database';
import {
	cinemasTable,
	genresTable,
	moviesGenresTable,
	moviesTable,
	showsTable,
	showtimesTable
} from '$lib/server/database/schema';
import { getExistingVersions } from '$lib/utils/movie';
import { ShowCinemas } from '$lib/utils/types';
import { error } from '@sveltejs/kit';
import { and, eq, inArray, like, or } from 'drizzle-orm';
import * as v from 'valibot';

export const getMovie = query(v.string(), async (slug) => {
	const { fetch } = getRequestEvent();
	const [movie] = await db
		.select({
			uuid: moviesTable.uuid,
			imdbId: moviesTable.imdbId,
			title: moviesTable.title,
			releaseDate: moviesTable.releaseDate,
			runtime: moviesTable.runtime,
			originalLanguage: moviesTable.originalLanguage,
			directors: moviesTable.directors,
			actors: moviesTable.actors,
			overview: moviesTable.overview,
			backdrop: moviesTable.backdrop,
			poster: moviesTable.poster,
			videos: moviesTable.videos
		})
		.from(moviesTable)
		.where(eq(moviesTable.slug, slug));

	if (!movie) {
		throw error(404, 'Not found');
	}

	const rawGenres = await db
		.select({ name: genresTable.name })
		.from(moviesGenresTable)
		.where(eq(moviesGenresTable.movieUuid, movie.uuid))
		.leftJoin(genresTable, eq(genresTable.id, moviesGenresTable.genreId));
	const genres = rawGenres.map((genre) => genre.name);

	return { ...movie, genres };
});

export const getMovieImdbRating = query(v.string(), async (imdbId) => {
	const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbId}`);
	if (response.status === 200) {
		const data: { imdbRating: string; imdbVotes: string } = await response.json();
		if (data.imdbRating !== 'N/A' && data.imdbRating !== 'N/A') {
			return { imdbRating: data.imdbRating, imdbVotes: data.imdbVotes };
		} else {
			return null;
		}
	}
});

export const getMovieShowtimes = query(
	v.object({
		uuid: v.string(),
		date: v.pipe(v.date(), v.toMinValue(new Date())),
		cinemas: v.array(v.enum(ShowCinemas)),
		versions: v.array(v.string())
	}),
	async ({ uuid, date, cinemas, versions }) => {
		const existingVersions = await getExistingVersions(versions);

		const showtimesFilters = [
			cinemas.length > 0 ? inArray(showtimesTable.cinemaId, cinemas) : undefined,
			existingVersions.length > 0
				? or(...existingVersions.map((v) => like(showtimesTable.version, `${v}%`)))
				: undefined
		].filter(Boolean);

		const showtimes = await db
			.select({
				dateTime: showtimesTable.dateTime,
				version: showtimesTable.version,
				cinema: {
					name: cinemasTable.name,
					website: cinemasTable.website
				}
			})
			.from(showsTable)
			.where(and(eq(showsTable.movieUuid, uuid), eq(showsTable.date, date)))
			.innerJoin(
				showtimesTable,
				and(eq(showtimesTable.showUuid, showsTable.uuid), ...showtimesFilters)
			)
			.innerJoin(cinemasTable, eq(cinemasTable.id, showtimesTable.cinemaId))
			.orderBy(showtimesTable.dateTime);

		return showtimes;
	}
);

export const getMovieAllShowsDates = query(v.string(), async (uuid) => {
	const rawShowsDates = await db
		.select({ date: showsTable.date })
		.from(showsTable)
		.where(eq(showsTable.movieUuid, uuid));
	const showsDates = rawShowsDates.map((show) => show.date.toISOString().split('T')[0]);

	return showsDates;
});
