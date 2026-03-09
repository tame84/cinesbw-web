import { getMovieShowtimes, getMovie } from '$lib/remotes/movie.remote';

export const load = async ({ params, parent }) => {
	const { showsFilters } = await parent();

	const movie = await getMovie(params.slug);
	const showtimes = await getMovieShowtimes({
		uuid: movie.uuid,
		date: showsFilters.date.toDate(),
		cinemas: showsFilters.cinemas,
		versions: showsFilters.versions
	});

	return { movie, showtimes };
};
