import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const revalidate = 3600; // regenerate at most once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? 'https://gatewise-events.vercel.app';

  const events = await db.event.findMany({
    where: { status: 'LIVE', visibility: 'PUBLIC' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 500,
  });

  const organizers = await db.user.findMany({
    where: { role: { in: ['HOST', 'ADMIN'] } },
    select: { id: true, updatedAt: true },
    take: 200,
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/events`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${base}/event/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const organizerRoutes: MetadataRoute.Sitemap = organizers.map((u) => ({
    url: `${base}/organizer/${u.id}`,
    lastModified: u.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...eventRoutes, ...organizerRoutes];
}
