import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { activeSurvey, question, surveyResponse, answer } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const surveyData = await db
		.select()
		.from(activeSurvey)
		.where(eq(activeSurvey.id, +event.params.id))
		.get();

	if (!surveyData) {
		return error(404, 'Enquete não encontrada');
	}

	const questions = await db
		.select()
		.from(question)
		.where(eq(question.surveyId, +event.params.id))
		.orderBy(question.position);

	return { survey: surveyData, questions };
};

export const actions: Actions = {
	submit: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}

		const formData = await event.request.formData();
		const sharingLevel = formData.get('sharingLevel')?.toString();
		const answersRaw = formData.get('answers')?.toString();
		const teamName = formData.get('teamName')?.toString()?.trim().toUpperCase() || null;

		if (!sharingLevel || !['public', 'anonymous'].includes(sharingLevel)) {
			return fail(400, { message: 'Nível de compartilhamento inválido' });
		}

		if (!answersRaw) {
			return fail(400, { message: 'Respostas não enviadas' });
		}

		let parsedAnswers: Record<string, number>;
		try {
			parsedAnswers = JSON.parse(answersRaw);
		} catch {
			return fail(400, { message: 'Formato de respostas inválido' });
		}

		const questions = await db
			.select()
			.from(question)
			.where(eq(question.surveyId, +event.params.id));

		for (const q of questions) {
			const val = parsedAnswers[q.id];
			if (val === undefined || val === null || !Number.isInteger(val) || val < 0 || val > 10) {
				return fail(400, {
					message: `Valor inválido para a pergunta "${q.title}". Use um número entre 0 e 10.`
				});
			}
		}

		const now = new Date();
		const userId = event.locals.user.id;

		const [newResponse] = await db.transaction(async (tx) => {
			const [row] = await tx
				.insert(surveyResponse)
				.values({
					userId,
					surveyId: +event.params.id,
					teamName,
					sharingLevel: sharingLevel as 'public' | 'anonymous',
					completedAt: now
				})
				.returning()
				.all();

			await tx
				.insert(answer)
				.values(
					questions.map((q) => ({
						userId,
						responseId: row.id,
						questionId: q.id,
						value: parsedAnswers[q.id]
					}))
				)
				.run();

			return [row];
		});

		return redirect(302, `/surveys/${event.params.id}/result/${newResponse.id}`);
	}
};
