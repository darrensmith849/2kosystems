CREATE TABLE "questionnaire_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"questionnaire_id" uuid NOT NULL,
	"business_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"has_existing_website" boolean,
	"existing_website_url" text,
	"business_aim" text,
	"site_goals" text,
	"notes" text,
	"logo_base64" text,
	"logo_content_type" text,
	"payment_method" text NOT NULL,
	"terms_accepted" boolean DEFAULT false NOT NULL,
	"signed_name" text NOT NULL,
	"signed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"signed_ip" text,
	"sla_pdf" text,
	"email_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"client_name" text NOT NULL,
	"price_amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'ZAR' NOT NULL,
	"payment_terms" text DEFAULT '50% upfront, 50% on completion' NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"created_by_operator_slug" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "questionnaires_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "questionnaire_submissions" ADD CONSTRAINT "questionnaire_submissions_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON DELETE cascade ON UPDATE no action;