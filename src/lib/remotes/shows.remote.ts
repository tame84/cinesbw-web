import { query } from '$app/server';
import { db } from '$lib/server/database';
import {
	cinemasTable,
	genresTable,
	moviesGenresTable,
	moviesTable,
	showsTable,
	showtimesTable,
	type Poster
} from '$lib/server/database/schema';
import { getExistingGenres, getExistingVersions } from '$lib/utils/movie';
import { ShowCinemas } from '$lib/utils/types';
import { and, eq, exists, inArray, like, or } from 'drizzle-orm';
import * as v from 'valibot';

interface Show {
	movie: {
		slug: string;
		title: string;
		runtime: number;
		genres: string[];
		poster: Poster | null;
	};
	showtimes: {
		dateTime: Date;
		version: string;
		cinema: {
			name: string;
			website: string;
		};
	}[];
}

export const getShows = query(
	v.object({
		date: v.pipe(v.date(), v.toMinValue(new Date())),
		cinemas: v.array(v.enum(ShowCinemas)),
		versions: v.array(v.string()),
		genres: v.array(v.number())
	}),
	async ({ date, cinemas, versions, genres }) => {
		const existingVersions = await getExistingVersions(versions);
		const existingGenres = await getExistingGenres(genres);

		const moviesGenresFilters = [
			existingGenres.length > 0
				? exists(
						db
							.select({ movieUuid: moviesGenresTable.movieUuid })
							.from(moviesGenresTable)
							.where(
								and(
									eq(moviesGenresTable.movieUuid, moviesTable.uuid),
									inArray(moviesGenresTable.genreId, existingGenres)
								)
							)
					)
				: undefined
		].filter(Boolean);
		const showtimesFilters = [
			cinemas.length > 0 ? inArray(showtimesTable.cinemaId, cinemas) : undefined,
			existingVersions.length > 0
				? or(...existingVersions.map((v) => like(showtimesTable.version, `${v}%`)))
				: undefined
		].filter(Boolean);

		const rawShows = await db
			.select({
				show: {
					uuid: showsTable.uuid,
					movieUuid: showsTable.movieUuid
				},
				movie: {
					uuid: moviesTable.uuid,
					slug: moviesTable.slug,
					title: moviesTable.title,
					runtime: moviesTable.runtime,
					poster: moviesTable.poster
				},
				genre: {
					id: genresTable.id,
					name: genresTable.name
				},
				showtime: {
					dateTime: showtimesTable.dateTime,
					version: showtimesTable.version
				},
				cinema: {
					name: cinemasTable.name,
					website: cinemasTable.website
				}
			})
			.from(showsTable)
			.where(and(eq(showsTable.date, date), ...moviesGenresFilters))
			.innerJoin(moviesTable, eq(moviesTable.uuid, showsTable.movieUuid))
			.innerJoin(moviesGenresTable, eq(moviesGenresTable.movieUuid, moviesTable.uuid))
			.innerJoin(genresTable, eq(genresTable.id, moviesGenresTable.genreId))
			.innerJoin(
				showtimesTable,
				and(eq(showtimesTable.showUuid, showsTable.uuid), ...showtimesFilters)
			)
			.innerJoin(cinemasTable, eq(cinemasTable.id, showtimesTable.cinemaId))
			.orderBy(moviesTable.slug, showtimesTable.dateTime, genresTable.name);

		const showsMap = new Map<string, Show>();
		const showtimesSet = new Set<string>();
		rawShows.forEach(async ({ show, movie, genre, showtime, cinema }) => {
			const showKey = `${show.uuid}-${show.movieUuid}`;
			if (!showsMap.has(showKey)) {
				showsMap.set(showKey, {
					movie: { ...movie, genres: [] },
					showtimes: []
				});
			}

			const showData = showsMap.get(showKey);
			if (showData) {
				showData.movie.genres.includes(genre.name) || showData.movie.genres.push(genre.name);

				const showtimeKey = `${show.uuid}-${showtime.dateTime.toString()}-${showtime.version}-${cinema.name}`;
				if (showtimesSet.has(showtimeKey)) {
					return;
				}
				showData.showtimes.push({
					dateTime: showtime.dateTime,
					version: showtime.version,
					cinema: { ...cinema }
				});
				showtimesSet.add(showtimeKey);
			}
		});

		const shows = Array.from(showsMap.values());

		return shows;
	}
);
