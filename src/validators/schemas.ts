import { z } from 'zod';
export const contactFormSchema = z.object({
	name: z.string(),
	phone: z.string().min(9).max(9).nullable(),
	email: z.string().email(),
	message: z.string().max(1000).nullable(),
});
