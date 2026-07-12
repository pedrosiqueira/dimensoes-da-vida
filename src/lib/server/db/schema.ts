import { sql, isNull } from 'drizzle-orm';
import { index, integer, sqliteTable, sqliteView, text } from 'drizzle-orm/sqlite-core';

import { user } from './auth.schema';

export * from './auth.schema';

const id = () => integer('id').primaryKey({ autoIncrement: true });

const createdAt = () =>
	integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull();

const updatedAt = () =>
	integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull();

export const survey = sqliteTable('survey', {
	id: id(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	creatorId: text('creator_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const question = sqliteTable('question', {
	id: id(),
	surveyId: integer('survey_id')
		.notNull()
		.references(() => survey.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description').notNull(),
	position: integer('position').notNull().default(0),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const surveyResponse = sqliteTable(
	'survey_response',
	{
		id: id(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		surveyId: integer('survey_id')
			.notNull()
			.references(() => survey.id, { onDelete: 'cascade' }),
		teamName: text('team_name'),
		sharingLevel: text('sharing_level', { enum: ['public', 'anonymous'] })
			.notNull()
			.default('anonymous'),
		completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
		deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(table) => [index('response_team_name_idx').on(table.teamName)]
);

export const answer = sqliteTable('answer', {
	id: id(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	responseId: integer('response_id')
		.notNull()
		.references(() => surveyResponse.id, { onDelete: 'cascade' }),
	questionId: integer('question_id')
		.notNull()
		.references(() => question.id, { onDelete: 'cascade' }),
	value: integer('value').notNull(),
	createdAt: createdAt()
});

export function active<T extends { deletedAt: import('drizzle-orm').SQLWrapper }>(table: T) {
	return isNull(table.deletedAt);
}

export const activeSurvey = sqliteView('active_survey', {
	id: integer('id').notNull(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	creatorId: text('creator_id').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
}).as(
	sql`select id, title, description, creator_id, created_at, updated_at from survey where deleted_at is null`
);

export const activeSurveyResponse = sqliteView('active_survey_response', {
	id: integer('id').notNull(),
	userId: text('user_id').notNull(),
	surveyId: integer('survey_id').notNull(),
	teamName: text('team_name'),
	sharingLevel: text('sharing_level').notNull(),
	completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
}).as(
	sql`select id, user_id, survey_id, team_name, sharing_level, completed_at, created_at, updated_at from survey_response where deleted_at is null`
);
