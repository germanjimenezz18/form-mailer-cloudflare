import { createMiddleware } from 'hono/factory';
import { turso } from './turso';
import { EnvType } from './types';

export const apiKeyAuth = createMiddleware(async (c, next) => {
	console.log('entra en apiKeyAuth');

	const apiKey = c.req.header('FORM_MAILER_CLOUDFLARE_API_KEY');
	if (!apiKey) {
		return c.json({ error: 'API key missing' }, 401);
	}

	const user = await getUserByToken(c.env, apiKey);
	if (!user) {
		return c.json({ error: 'Invalid API key' }, 401);
	}

	c.set('user', user);
	await next();
});

async function getUserByToken(env: EnvType, token: string): Promise<any> {
	try {
		const resultSet = await turso(env).execute({
			sql: 'SELECT * FROM api_keys JOIN users ON api_keys.user_id = users.id WHERE api_keys.api_key = ?',
			args: [token],
		});

		const { rows } = resultSet;

		if (rows.length === 0) {
			return null;
		}

		return rows.map((row) => ({ id: Number(row.user_id), name: row.name, email: row.email } as any))[0];
	} catch (error) {
		console.error(error);
		return null;
	}
}
