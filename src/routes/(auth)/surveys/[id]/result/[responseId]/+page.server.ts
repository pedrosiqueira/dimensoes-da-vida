import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	activeSurvey,
	activeSurveyResponse,
	surveyResponse,
	answer,
	question,
	user
} from '$lib/server/db/schema';
import { eq, and, isNotNull, ne, inArray, sql } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const responseData = await db
		.select()
		.from(activeSurveyResponse)
		.where(eq(activeSurveyResponse.id, +event.params.responseId))
		.get();

	if (!responseData) {
		return error(404, 'Resposta não encontrada');
	}

	if (responseData.userId !== event.locals.user!.id) {
		return error(403, 'Acesso negado');
	}

	const surveyData = await db
		.select()
		.from(activeSurvey)
		.where(eq(activeSurvey.id, +event.params.id))
		.get();

	if (!surveyData) {
		return error(404, 'Enquete não encontrada');
	}

	const answersData = await db
		.select({
			id: answer.id,
			value: answer.value,
			questionId: answer.questionId,
			questionTitle: question.title,
			questionDescription: question.description,
			questionPosition: question.position
		})
		.from(answer)
		.innerJoin(question, eq(answer.questionId, question.id))
		.where(eq(answer.responseId, +event.params.responseId))
		.orderBy(question.position);

	const allAverage = await db
		.select({
			questionId: answer.questionId,
			value: sql<number>`round(avg(${answer.value}), 1)`
		})
		.from(answer)
		.innerJoin(activeSurveyResponse, eq(answer.responseId, activeSurveyResponse.id))
		.where(
			and(
				eq(activeSurveyResponse.surveyId, +event.params.id),
				isNotNull(activeSurveyResponse.completedAt)
			)
		)
		.groupBy(answer.questionId)
		.orderBy(answer.questionId);

	let teamAverage = null;

	if (responseData.teamName) {
		teamAverage = await db
			.select({
				questionId: answer.questionId,
				value: sql<number>`round(avg(${answer.value}), 1)`
			})
			.from(answer)
			.innerJoin(activeSurveyResponse, eq(answer.responseId, activeSurveyResponse.id))
			.where(
				and(
					eq(activeSurveyResponse.surveyId, +event.params.id),
					isNotNull(activeSurveyResponse.completedAt),
					eq(activeSurveyResponse.teamName, responseData.teamName)
				)
			)
			.groupBy(answer.questionId)
			.orderBy(answer.questionId);
	}

	let teamMembers: {
		userId: string;
		userName: string;
		answers: { questionId: number; value: number }[];
	}[] = [];

	if (responseData.sharingLevel === 'public' && responseData.teamName) {
		const members = await db
			.select({
				id: activeSurveyResponse.id,
				userId: activeSurveyResponse.userId,
				userName: user.name
			})
			.from(activeSurveyResponse)
			.innerJoin(user, eq(activeSurveyResponse.userId, user.id))
			.where(
				and(
					eq(activeSurveyResponse.surveyId, +event.params.id),
					isNotNull(activeSurveyResponse.completedAt),
					eq(activeSurveyResponse.sharingLevel, 'public'),
					eq(activeSurveyResponse.teamName, responseData.teamName),
					ne(activeSurveyResponse.id, +event.params.responseId)
				)
			);

		if (members.length > 0) {
			const memberResponseIds = members.map((m) => m.id);
			const memberAnswers = await db
				.select({
					responseId: answer.responseId,
					questionId: answer.questionId,
					value: answer.value
				})
				.from(answer)
				.where(inArray(answer.responseId, memberResponseIds))
				.orderBy(answer.questionId);

			const answersByResponse = new Map<number, { questionId: number; value: number }[]>();
			for (const ma of memberAnswers) {
				if (!answersByResponse.has(ma.responseId)) {
					answersByResponse.set(ma.responseId, []);
				}
				answersByResponse.get(ma.responseId)!.push({ questionId: ma.questionId, value: ma.value });
			}

			teamMembers = members.map((m) => ({
				userId: m.userId,
				userName: m.userName,
				answers: answersByResponse.get(m.id) ?? []
			}));
		}
	}

	const comparison = { allAverage, teamAverage, teamMembers };

	return {
		response: responseData,
		survey: surveyData,
		answers: answersData,
		comparison
	};
};

export const actions: Actions = {
	setTeam: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}

		const formData = await event.request.formData();
		const teamName = formData.get('teamName')?.toString()?.trim().toLowerCase() ?? '';

		const existing = await db
			.select({ id: surveyResponse.id })
			.from(surveyResponse)
			.where(
				and(
					eq(surveyResponse.id, +event.params.responseId),
					eq(surveyResponse.userId, event.locals.user.id)
				)
			)
			.get();

		if (!existing) {
			return fail(404, { message: 'Resposta não encontrada' });
		}

		await db
			.update(surveyResponse)
			.set({ teamName })
			.where(eq(surveyResponse.id, +event.params.responseId));

		return { success: true };
	},

	deleteResponse: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}

		const existing = await db
			.select({ id: surveyResponse.id })
			.from(surveyResponse)
			.where(
				and(
					eq(surveyResponse.id, +event.params.responseId),
					eq(surveyResponse.userId, event.locals.user.id)
				)
			)
			.get();

		if (!existing) {
			return fail(404, { message: 'Resposta não encontrada' });
		}

		await db
			.update(surveyResponse)
			.set({ deletedAt: new Date() })
			.where(eq(surveyResponse.id, +event.params.responseId));

		return redirect(302, '/my-surveys');
	}
};
