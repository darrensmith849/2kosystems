CREATE TABLE "cloudflare_pages_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cf_project_id" text NOT NULL,
	"name" text NOT NULL,
	"subdomain" text,
	"production_branch" text,
	"latest_deployment_status" text,
	"custom_domains" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"state" text DEFAULT 'seen' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cloudflare_pages_projects_cf_project_id_unique" UNIQUE("cf_project_id")
);
--> statement-breakpoint
CREATE TABLE "cloudflare_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cf_zone_id" text NOT NULL,
	"name" text NOT NULL,
	"status" text,
	"plan" text,
	"name_servers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"domain_id" uuid,
	"state" text DEFAULT 'seen' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cloudflare_zones_cf_zone_id_unique" UNIQUE("cf_zone_id")
);
--> statement-breakpoint
CREATE TABLE "dns_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cf_record_id" text NOT NULL,
	"cf_zone_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"proxied" boolean DEFAULT false NOT NULL,
	"ttl" integer,
	"state" text DEFAULT 'seen' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dns_records_cf_record_id_unique" UNIQUE("cf_record_id")
);
--> statement-breakpoint
CREATE TABLE "hetzner_servers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hz_server_id" integer NOT NULL,
	"name" text NOT NULL,
	"status" text,
	"server_type" text,
	"location" text,
	"public_ipv4" text,
	"public_ipv6" text,
	"private_ips" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"labels" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at_cloud" timestamp with time zone,
	"state" text DEFAULT 'seen' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hetzner_servers_hz_server_id_unique" UNIQUE("hz_server_id")
);
--> statement-breakpoint
ALTER TABLE "cloudflare_zones" ADD CONSTRAINT "cloudflare_zones_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;