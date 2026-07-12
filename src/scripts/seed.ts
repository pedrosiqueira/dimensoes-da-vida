import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import * as schema from '../lib/server/db/schema';

const DATABASE_URL = process.env.DATABASE_URL ?? 'file:local.db';

const client = createClient({ url: DATABASE_URL });
const db = drizzle(client, { schema });

const SEED_USER_ID = 'seed-user-00000000-0000-0000-0000-000000000000';

async function main() {
	const existingUser = await db
		.select({ id: schema.user.id })
		.from(schema.user)
		.where(eq(schema.user.id, SEED_USER_ID))
		.get();

	if (!existingUser) {
		await db
			.insert(schema.user)
			.values({
				id: SEED_USER_ID,
				name: 'Sistema',
				email: 'sistema@dimensoesdavida.app',
				emailVerified: true
			})
			.run();
		console.log('Seed user created.');
	}

	await db.delete(schema.survey).where(eq(schema.survey.creatorId, SEED_USER_ID)).run();

	// ── Survey 1: Termómetro do Dia (fun) ──────────────────────
	const funResult = await db
		.insert(schema.survey)
		.values({
			title: 'Termômetro do Dia',
			description:
				'Como está seu dia hoje? Avalie cada aspecto de 0 a 10. Zero significa "péssimo, nunca esteve tão ruim" e 10 significa "perfeito, não poderia estar melhor".',
			creatorId: SEED_USER_ID
		})
		.run();

	const funSurveyId = Number(funResult.lastInsertRowid);

	const funQuestions = [
		{
			title: 'Energia',
			description: 'Como você avalia seu nível de energia hoje?',
			position: 1
		},
		{
			title: 'Humor',
			description: 'Como está seu humor neste exato momento?',
			position: 2
		},
		{
			title: 'Produtividade',
			description: 'Quão produtivo você se sentiu hoje?',
			position: 3
		},
		{
			title: 'Sono',
			description: 'Como foi a qualidade do seu sono na última noite?',
			position: 4
		},
		{
			title: 'Alimentação',
			description: 'Como você avalia sua alimentação hoje?',
			position: 5
		},
		{
			title: 'Social',
			description: 'Como estão suas interações sociais hoje?',
			position: 6
		}
	];

	await db
		.insert(schema.question)
		.values(
			funQuestions.map((q) => ({
				surveyId: funSurveyId,
				...q
			}))
		)
		.run();

	console.log(`Survey created: "Termômetro do Dia" (id: ${funSurveyId})`);

	// ── Survey 2: Roda das Virtudes ──────────────────────────
	const virtudesResult = await db
		.insert(schema.survey)
		.values({
			title: 'Roda das Virtudes',
			description:
				'Para cada uma das virtudes, atribua uma nota de zero a dez, sendo que zero significa que a virtude não está desenvolvida em sua vida e 10 significa que a virtude está plenamente desenvolvida em seu dia a dia.',
			creatorId: SEED_USER_ID
		})
		.run();

	const virtudesSurveyId = Number(virtudesResult.lastInsertRowid);

	const virtudesQuestions = [
		{
			title: 'Justiça',
			description:
				'Eu tenho vivido a justiça de Deus quando procuro não explorar ninguém, mas cuidar das pessoas ao meu redor?',
			position: 1
		},
		{
			title: 'Integridade',
			description:
				'Eu tenho exercido liderança com ética e responsabilidade quando coloco o bem das pessoas acima dos meus próprios interesses?',
			position: 2
		},
		{
			title: 'Esperança',
			description:
				'Minha vida tem sido fortalecida pela esperança quando percebo que posso descansar na promessa de Deus?',
			position: 3
		},
		{
			title: 'Descanso',
			description:
				'Minha vida tem encontrado descanso quando confio que Deus está no controle, mesmo diante da opressão?',
			position: 4
		},
		{
			title: 'Fé',
			description:
				'Minha vida tem sido fortalecida quando escolho viver pela fé, mesmo diante das dificuldades?',
			position: 5
		},
		{
			title: 'Humildade',
			description:
				'Minha vida tem sido marcada pela humildade quando reconheço minha dependência de Deus e busco a sua vontade acima da minha?',
			position: 6
		},
		{
			title: 'Prioridade',
			description:
				'Eu tenho colocado Deus no centro da minha vida quando escolho priorizar a sua vontade acima dos meus próprios desejos?',
			position: 7
		},
		{
			title: 'Dependência',
			description:
				'Eu tenho experimentado a dependência do Espírito quando reconheço minhas limitações e confio que ele me capacita para servir?',
			position: 8
		},
		{
			title: 'Coerência',
			description:
				'Minha vida tem refletido coerência quando minhas ações demonstram a fé que professo?',
			position: 9
		},
		{
			title: 'Esperança',
			description:
				'Minha vida tem sido sustentada pela esperança quando acredito que, mesmo nas dificuldades, Deus cumprirá suas promessas?',
			position: 10
		},
		{
			title: 'Submissão',
			description:
				'Eu tenho experimentado paz quando vivo em submissão ao governo de Deus, confiando que ele está no controle?',
			position: 11
		},
		{
			title: 'Honra',
			description:
				'Eu tenho vivido a honra ao Senhor quando minhas atitudes demonstram respeito e devoção sincera?',
			position: 12
		},
		{
			title: 'Reverência',
			description:
				'Minha vida tem refletido reverência quando minhas escolhas mostram que estou me preparando para o encontro definitivo com o Senhor?',
			position: 13
		}
	];

	await db
		.insert(schema.question)
		.values(
			virtudesQuestions.map((q) => ({
				surveyId: virtudesSurveyId,
				...q
			}))
		)
		.run();

	console.log(`Survey created: "Roda das Virtudes" (id: ${virtudesSurveyId})`);

	client.close();
	console.log('Seed complete!');
}

main().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
