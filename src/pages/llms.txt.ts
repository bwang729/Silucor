import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { profile } from '~/data/profile';

/**
 * llms.txt — a 2026 community standard giving LLM crawlers a structured, plain
 * text entry into the site. See https://llmstxt.org for the spec.
 */
export async function GET(context: APIContext) {
  const origin = (context.site ?? new URL(profile.meta.origin)).toString().replace(/\/$/, '');
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

  const body = [
    `# ${profile.brand.en}`,
    '',
    `> ${profile.brand.tagline.en}`,
    '',
    profile.identity.bio.en,
    '',
    '## Projects',
    ...projects.map((p) => `- [${p.data.title}](${origin}/projects/${p.id}) — ${p.data.summary}`),
    '',
    '## Recent posts',
    ...posts
      .slice(0, 30)
      .map((p) => `- [${p.data.title}](${origin}/blog/${p.id}) — ${p.data.description}`),
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
