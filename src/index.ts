import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { Resend } from 'resend';
import { LeadModel } from './interfaces';
import { EnvType, User, Variables } from './types';
import { contactFormSchema } from './validators/schemas';
import { turso } from './turso';
import { apiKeyAuth } from './middleware';
import { logger } from 'hono/logger';

async function createLead(env: EnvType, values: any, userId: number): Promise<any> {
	try {
		const resultSet = await turso(env).execute({
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

const app = new Hono<{ Bindings: EnvType; Variables: Variables }>().basePath('/api');
app.use(cors());
app.use(logger());

app.get('/', (c) => {
	return c.json({ message: 'Hello World' });
});

app.post('/process-form', apiKeyAuth, zValidator('json', contactFormSchema), async (c) => {
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
