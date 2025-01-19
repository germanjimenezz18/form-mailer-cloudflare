import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import { createClient, type Client } from '@libsql/client';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

type EnvType = {
	TURSO_URL?: string;
	TURSO_AUTH_TOKEN?: string;
};

type User = {
	id: number;
	name: string;
	email: string;
};

type Variables = {
	user: User;
};

let client: Client | null = null;

const formSchema = z.object({
	name: z.string(),
	phone: z.string().min(9).max(9),
	email: z.string().email().nullable(),
	message: z.string().min(10).max(1000).nullable(),
});

const apiKeyAuth = createMiddleware(async (c, next) => {
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

async function getAllUsers(env: EnvType): Promise<any[]> {
	const resultSet = await getClient(env).execute('select * from users');
	const { rows } = resultSet;
	return rows.map((row) => ({ id: Number(row.id), name: row.name } as any));
}

async function getUserByToken(env: EnvType, token: string): Promise<any> {
	try {
		const resultSet = await getClient(env).execute({
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

/**
 * @returns a LibSQL Client object used to execute SQL statements
 */
function getClient(env: EnvType): Client {
	if (!client) {
		client = createClient({
			url: env.TURSO_URL as string,
			authToken: env.TURSO_AUTH_TOKEN as string,
		});
	}
	return client;
}

function sendEmail(values: any, user: User) {
	return { message: `Email sent to ${user.email}` };
}

const app = new Hono<{ Bindings: EnvType; Variables: Variables }>();
app.use(cors());
app.get('/', (c) => {
	return c.json({ message: 'Hello World' });
});

app.post('/process-form', apiKeyAuth, zValidator('json', formSchema), (c) => {
	const user = c.get('user');
	const values = c.req.valid('json');

	if (!user) {
		return c.json({ error: 'User not found' }, 401);
	}

	// Register lead with null handling
	const registerLead = getClient(c.env).execute({
		sql: 'INSERT INTO leads (name, phone, email, message) VALUES (?, ?, ?, ?)',
		args: [values.name, values.phone, values.email ?? null, values.message ?? null],
	});

	const emailResponse = sendEmail(values, user);

	return c.json({ message: 'Form processed successfully', user });
});

app.get('/users', async (c) => {
	const users = await getAllUsers(c.env);
	return c.json(users);
});

export default app;
