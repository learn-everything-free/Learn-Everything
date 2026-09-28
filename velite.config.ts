import { relative } from "node:path";
import { defineConfig, s, context } from "velite";
import rehypePrettyCode from "rehype-pretty-code";

/**
 * Content layer: compiles content/ into typed, queryable data at build time.
 * Every skill.yaml / topic.yaml / task.yaml / lesson.md is validated against
 * these schemas — a malformed content PR fails this build instead of runtime.
 */

/** File path of the content file, relative to content/, posix-separated. */
const contentPath = s
  .custom<string>(() => true)
  .transform(() => {
    const ctx = context();
    return relative(ctx.config.root, ctx.file.path).replace(/\\/g, "/");
  });

const step = s.strictObject({
  title: s.string(),
  detail: s.string(),
  command: s.string().optional(),
});

/** Reference to a validator in validators/registry.yaml, with its params. */
const validationEntry = s
  .object({
    validator: s.string(),
    label: s.string(),
  })
  .passthrough();

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  strict: true,
  collections: {
    paths: {
      name: "LearningPath",
      pattern: "*/path.yaml",
      schema: s.strictObject({
        slug: s.string(),
        title: s.string(),
        role: s.string(),
        tagline: s.string(),
        order: s.number(),
        file: contentPath,
      }),
    },
    validators: {
      name: "ValidatorRegistry",
      pattern: "validators/registry.yaml",
      single: true,
      schema: s.strictObject({
        version: s.number(),
        validators: s.array(
          s.strictObject({
            id: s.string(),
            kind: s.string(),
            description: s.string(),
            params: s.array(s.string()),
            fields: s.record(s.string(), s.string()),
          }),
        ),
      }),
    },
    skills: {
      name: "Skill",
      pattern: "*/**/skill.yaml",
      schema: s.strictObject({
        slug: s.string(),
        title: s.string(),
        summary: s.string(),
        /** which learning path this skill belongs to (directory name) */
        path: s.string(),
        order: s.number(),
        file: contentPath,
      }),
    },
    topics: {
      name: "Topic",
      pattern: "*/**/topic.yaml",
      schema: s.strictObject({
        slug: s.string(),
        title: s.string(),
        summary: s.string(),
        order: s.number(),
        /** task slugs this topic includes (files may live in any topic dir) */
        tasks: s.array(s.string()),
        file: contentPath,
      }),
    },
    tasks: {
      name: "Task",
      pattern: "*/**/tasks/*/task.yaml",
      schema: s.strictObject({
        slug: s.slug("task", ["admin", "login"]),
        title: s.string(),
        type: s.enum([
          "concept",
          "guided",
          "practice",
          "challenge",
          "scenario",
          "project",
        ]),
        difficulty: s.enum(["beginner", "intermediate", "advanced"]),
        description: s.string(),
        requirements: s.array(s.string()),
        environment: s.string(),
        /** validator registry references — resolved against validators/registry.yaml */
        validation: s.array(validationEntry),
        steps: s.array(step),
        file: contentPath,
      }),
    },
    lessons: {
      name: "Lesson",
      pattern: "*/**/lesson.md",
      schema: s.strictObject({
        content: s.markdown({
          rehypePlugins: [
            // Dual themes: light is rendered inline, dark is exposed per-token
            // as a --shiki-dark custom property and consumed in globals.css.
            [
              rehypePrettyCode,
              {
                themes: { light: "github-light", dark: "github-dark" },
                keepBackground: false,
              },
            ],
          ],
        }),
        file: contentPath,
      }),
    },
  },
});
