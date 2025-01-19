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
