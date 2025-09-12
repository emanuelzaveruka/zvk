import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',

  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    keywords: z.array(z.string()),
    image: z.string().optional(),
    published: z.union([z.boolean(), z.literal('preview')]).default(false)
  })
});

export const collections = { blog };
