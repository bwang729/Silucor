import fs from 'node:fs';
import path from 'node:path';
import type { APIContext } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { profile } from '~/data/profile';

const interRegular = fs.readFileSync(
  path.resolve('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff'),
);
const interBold = fs.readFileSync(
  path.resolve('node_modules/@fontsource/inter/files/inter-latin-700-normal.woff'),
);
const groteskBold = fs.readFileSync(
  path.resolve(
    'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff',
  ),
);
const notoSc400 = fs.readFileSync(
  path.resolve(
    'node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff',
  ),
);
const notoSc700 = fs.readFileSync(
  path.resolve(
    'node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff',
  ),
);

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((p) => ({ params: { slug: p.id }, props: { post: p } }));
}

type Props = { post: CollectionEntry<'blog'> };

export async function GET(ctx: APIContext<Props>) {
  const { post } = ctx.props;
  const date = post.data.publishedAt.toISOString().slice(0, 10);
  const brand = profile.brand.en;
  const tagline = profile.brand.tagline.en;

  const node = {
    type: 'div',
    props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background:
            'linear-gradient(135deg, #0b1326 0%, #0f1b3b 55%, #0b2638 100%)',
          color: '#e7ecf5',
          fontFamily: 'Inter',
          position: 'relative',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'radial-gradient(600px circle at 80% 20%, rgba(152,203,255,0.18), transparent 65%)',
              },
              children: '',
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '42px',
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      background:
                        'linear-gradient(135deg, #98cbff 0%, #3cddc7 100%)',
                      color: '#0b1326',
                      fontFamily: 'Space Grotesk',
                      fontWeight: 700,
                      fontSize: '22px',
                    },
                    children: 'S',
                  },
                },
                { type: 'span', props: { children: brand } },
                {
                  type: 'span',
                  props: {
                    style: { color: '#7a8aa8', fontWeight: 400 },
                    children: `· ${tagline}`,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '24px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'Space Grotesk',
                      fontWeight: 700,
                      fontSize:
                        post.data.title.length > 60 ? '60px' : '78px',
                      lineHeight: 1.05,
                      letterSpacing: '-0.03em',
                      color: '#f4f7fc',
                    },
                    children: post.data.title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '26px',
                      lineHeight: 1.45,
                      color: '#b3bed1',
                      maxWidth: '920px',
                    },
                    children: post.data.description,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '20px',
                color: '#7a8aa8',
                fontWeight: 500,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', gap: '16px' },
                    children: [
                      { type: 'span', props: { children: date } },
                      { type: 'span', props: { children: '·' } },
                      {
                        type: 'span',
                        props: { children: post.data.lang.toUpperCase() },
                      },
                      ...(post.data.tags.length > 0
                        ? [
                            { type: 'span', props: { children: '·' } },
                            {
                              type: 'span',
                              props: {
                                style: { color: '#3cddc7' },
                                children: post.data.tags
                                  .slice(0, 3)
                                  .map((t) => `#${t}`)
                                  .join('  '),
                              },
                            },
                          ]
                        : []),
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { color: '#98cbff' },
                    children: profile.meta.origin.replace(/^https?:\/\//, ''),
                  },
                },
              ],
            },
          },
        ],
      },
  };

  const svg = await satori(node as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
      { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
      {
        name: 'Space Grotesk',
        data: groteskBold,
        weight: 700,
        style: 'normal',
      },
      {
        name: 'Noto Sans SC',
        data: notoSc400,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Noto Sans SC',
        data: notoSc700,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const png = new Resvg(svg).render().asPng();

  return new Response(png as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
