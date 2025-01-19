export type EnvType = {
	TURSO_URL?: string;
	TURSO_AUTH_TOKEN?: string;
	RESEND_API_KEY?: string;
};

export type User = {
	id: number;
	name: string;
	email: string;
};

export type Variables = {
	user: User;
};
