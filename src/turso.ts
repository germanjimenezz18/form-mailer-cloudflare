import { createClient, type Client } from '@libsql/client';
import { EnvType } from './types';

/**
 * @returns a LibSQL Client object used to execute SQL statements
 */
let client: Client | null = null;

export function turso(env: EnvType): Client {
	if (!client) {
		client = createClient({
			url: env.TURSO_URL as string,
			authToken: env.TURSO_AUTH_TOKEN as string,
		});
	}
	return client;
}
