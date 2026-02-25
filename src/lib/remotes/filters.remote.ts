import { query } from '$app/server';
import { db } from '$lib/server/database';
import { cinemasTable, genresTable, showsTable, showtimesTable } from '$lib/server/database/schema';
import { eq, gte } from 'drizzle-orm';

export const getShowsDates = query(async () => {
	const rawShowsDates = await db
		.selectDistinct({ date: showsTable.date })
		.from(showsTable)
		.where(gte(showsTable.date, new Date()))
		.orderBy(showsTable.date);
	const showsDate = rawShowsDates.map(({ date }) => date);

	return showsDate;
});

export const getShowsCinemas = query(async () => {
	const showsCinemas = await db
		.selectDistinct({ id: cinemasTable.id, name: cinemasTable.name })
		.from(showtimesTable)
		.innerJoin(cinemasTable, eq(cinemasTable.id, showtimesTable.cinemaId))
		.orderBy(cinemasTable.name);

	return showsCinemas;
});

export const getShowsVersions = query(async () => {
	const rawShowsVersions = await db
		.selectDistinct({ version: showtimesTable.version })
		.from(showtimesTable)
		.orderBy(showtimesTable.version);
	const showsVersions = Array.from(
		new Set(rawShowsVersions.map(({ version }) => version.slice(0, 2)))
	);

	return showsVersions;
});

export const getShowsGenres = query(async () => {
	const showsGenres = await db
		.selectDistinct({ id: genresTable.id, name: genresTable.name })
		.from(genresTable)
		.orderBy(genresTable.name);

	return showsGenres;
});
