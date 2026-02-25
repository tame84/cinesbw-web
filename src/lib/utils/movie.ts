import { getShowsGenres, getShowsVersions } from '$lib/remotes/filters.remote';

export const getExistingVersions = async (versions: string[]) => {
	const allVersions = await getShowsVersions();
	return versions.filter((v) => allVersions.includes(v));
};

export const getExistingGenres = async (genreIds: number[]) => {
	const allGenres = await getShowsGenres();
	const existingGenreIds = allGenres.map((g) => g.id);
	return genreIds.filter((id) => existingGenreIds.includes(id));
};

export const runtimeMinuteToHours = (runtime: number) => {
	if (runtime === 0) {
		return null;
	}

	const hours = Math.floor(runtime / 60);
	const minutes = runtime % 60;

	if (hours === 0) {
		return `${minutes}min`;
	} else {
		return `${hours}h${minutes > 0 ? `${('0' + minutes).slice(-2)}` : ''}`;
	}
};
