import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => {
	return c.json({ message: 'Hello World' });
});
export default app;
