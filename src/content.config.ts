import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    price: z.number(),
    currency: z.string().default('TRY'),
    collection: z.string(),
    colors: z.array(z.string()),
    sizes: z.array(z.string()),
    inStock: z.boolean().default(true),
    badge: z.string().optional(),
    images: z.array(z.string()),
    has360: z.boolean().default(false),
    description: z.string(),
    material: z.string(),
    care: z.array(z.string()),
    modelInfo: z.string(),
  }),
});

export const collections = { products };
