import { query } from '$app/server';
import { db } from '$lib/server/database';
import { showsTable } from '$lib/server/database/schema';

export const getLastScrapeDate = query(async () => {
	const [{ date }] = await db
		.selectDistinct({ date: showsTable.date })
		.from(showsTable)
		.orderBy(showsTable.date)
		.limit(1);

	return date;
});
