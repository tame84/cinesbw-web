import type { ShowCinemas } from '$lib/utils/types';
import dayjs from 'dayjs';

export const load = ({ url }) => {
	const searchParams = url.searchParams;
	const date = searchParams.get('date');
	const cinemas = searchParams.get('cinemas');
	const versions = searchParams.get('versions');
	const genres = searchParams.get('genres');

	return {
		showsFilters: {
			date: date ? dayjs.tz(date) : dayjs.tz().startOf('date'),
			cinemas: cinemas ? (cinemas.split(',').map(Number) as ShowCinemas[]) : [],
			versions: versions ? versions.split(',') : [],
			genres: genres ? genres.split(',').map(Number) : []
		}
	};
};
