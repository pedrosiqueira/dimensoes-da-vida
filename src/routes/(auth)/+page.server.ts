import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { activeSurveyResponse, survey } from '$lib/server/db/schema';
import { eq, and, isNotNull, desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const responses = await db
		.select({
			id: activeSurveyResponse.id,
			surveyId: activeSurveyResponse.surveyId,
			surveyTitle: survey.title,
			completedAt: activeSurveyResponse.completedAt
		})
		.from(activeSurveyResponse)
		.innerJoin(survey, eq(activeSurveyResponse.surveyId, survey.id))
		.where(
			and(
				eq(activeSurveyResponse.userId, event.locals.user!.id),
				isNotNull(activeSurveyResponse.completedAt)
			)
		)
		.orderBy(desc(activeSurveyResponse.completedAt))
		.limit(5);

	return { responses };
};
