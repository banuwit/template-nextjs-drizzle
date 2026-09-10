CREATE TABLE "parameters" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "parameters_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"group" varchar(50) NOT NULL,
	"code" varchar(100) NOT NULL,
	"value" varchar(150) NOT NULL,
	"description" text,
	"text_color" varchar(10),
	"bg_color" varchar(10),
	"attributes" jsonb,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" integer,
	"updated_by" integer,
	"deleted_at" timestamp,
	"deleted_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parameters_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "parameters" ADD CONSTRAINT "parameters_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parameters" ADD CONSTRAINT "parameters_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parameters" ADD CONSTRAINT "parameters_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;