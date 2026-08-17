CREATE TABLE "repos" (
	"id" serial PRIMARY KEY NOT NULL,
	"repo_name" text NOT NULL,
	"full_name" text NOT NULL,
	"private" boolean DEFAULT false NOT NULL,
	"html_url" text NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"language" text,
	"default_branch" text NOT NULL,
	"owner" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"credits" integer DEFAULT 100 NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
