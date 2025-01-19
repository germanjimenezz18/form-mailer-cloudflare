import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import { createClient, type Client } from '@libsql/client';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { Resend } from 'resend';

type EnvType = {
	TURSO_URL?: string;
	TURSO_AUTH_TOKEN?: string;
	RESEND_API_KEY?: string;
};

type User = {
	id: number;
	name: string;
	email: string;
};

export interface LeadModel {
	id: number;
	user_id: number;
	name: string;
	phone?: string;
	email: string;
	message: string;
	created_at: Date;
	updated_at: Date;
}

type Variables = {
	user: User;
};

let client: Client | null = null;

const formSchema = z.object({
	name: z.string(),
	phone: z.string().min(9).max(9).nullable(),
	email: z.string().email(),
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

async function createLead(env: EnvType, values: any, userId: number): Promise<any> {
	try {
		const resultSet = await getClient(env).execute({
			sql: 'INSERT INTO leads (user_id, name, phone, email, message) VALUES (?,?, ?, ?, ?) RETURNING *',
			args: [userId, values.name, values.phone, values.email ?? null, values.message ?? null],
		});

		const { rows } = resultSet;
		console.log({ rows });
		if (rows.length === 0) {
			return null;
		}

		return rows[0];
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

async function sendEmail(env: EnvType, lead: LeadModel, user: User): Promise<any> {
	const resend = new Resend(env.RESEND_API_KEY);
	console.log({ lead, user });

	const html = `
		<h1>Nuevo Lead</h1>
		<p>Lead ID: ${lead.id}</p>
		<p>Name: ${lead.name}</p>
		<p>Phone: ${lead.phone}</p>
		<p>Email: ${lead.email}</p>
		<p>Message: ${lead.message}</p>
		<p>Created by: ${user.name}</p>
	`;

	const res = await resend.emails.send({
		from: 'German Jimenez<onboarding@resend.dev>',
		to: ['germanjimenezz18@gmail.com'],
		subject: `Lead #${lead.id} from ${user.name}`,
		html,
	});

	if (res.error) {
		console.error('Error sending email:', res.error);
	}

	return { message: res };
}

const app = new Hono<{ Bindings: EnvType; Variables: Variables }>();
app.use(cors());
app.get('/', (c) => {
	return c.json({ message: 'Hello World' });
});

app.post('/process-form', apiKeyAuth, zValidator('json', formSchema), async (c) => {
	const user = c.get('user');
	const values = c.req.valid('json');
	if (!user) return c.json({ error: 'User not found' }, 401);

	try {
		const newLead = await createLead(c.env, values, user.id);
		const emailResponse = await sendEmail(c.env, newLead, user);

		return c.json({ success: true, newLead, emailResponse });
	} catch (error) {
		console.error('Error processing form:', error);
		return c.json({ success: false, error: 'Error processing your request' }, 500);
	}
});

export default app;
