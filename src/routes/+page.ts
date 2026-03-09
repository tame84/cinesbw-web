import { getShows } from '$lib/remotes/shows.remote';

export const load = async ({ parent }) => {
	const { showsFilters } = await parent();

	const shows = await getShows({
		date: showsFilters.date.toDate(),
		cinemas: showsFilters.cinemas,
		versions: showsFilters.versions,
		genres: showsFilters.genres
	});

	return { shows };
};
