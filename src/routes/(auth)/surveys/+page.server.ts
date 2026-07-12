import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { activeSurvey } from '$lib/server/db/schema';
import { desc, sql } from 'drizzle-orm';

const PER_PAGE = 10;

export const load: PageServerLoad = async (event) => {
	const page = Math.max(1, parseInt(event.url.searchParams.get('page') ?? '1'));
	const offset = (page - 1) * PER_PAGE;

	const surveys = await db
		.select()
		.from(activeSurvey)
		.orderBy(desc(activeSurvey.createdAt))
		.limit(PER_PAGE)
		.offset(offset);

	const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(activeSurvey);

	return { surveys, page, totalPages: Math.ceil(count / PER_PAGE) };
};
