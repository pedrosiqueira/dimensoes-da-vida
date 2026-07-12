import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user, account } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	return {
		user: event.locals.user
	};
};

export const actions: Actions = {
	updateName: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}

		const formData = await event.request.formData();
		const name = formData.get('name')?.toString().trim();

		if (!name || name.length < 2 || name.length > 32) {
			return fail(400, { message: 'Nome deve ter entre 2 e 32 caracteres' });
		}

		await auth.api.updateUser({
			body: { name },
			headers: event.request.headers
		});

		return { success: true };
	},

	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});

		return redirect(302, '/login');
	},

	deleteAccount: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}

		const googleAccount = await db
			.select({ accessToken: account.accessToken })
			.from(account)
			.where(and(eq(account.userId, event.locals.user.id), eq(account.providerId, 'google')))
			.get();

		if (googleAccount?.accessToken) {
			try {
				await fetch(`https://oauth2.googleapis.com/revoke?token=${googleAccount.accessToken}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				});
			} catch {
				// Google token may already be expired — proceed with local deletion
			}
		}

		await db.delete(user).where(eq(user.id, event.locals.user.id));

		return redirect(302, '/login');
	}
};
