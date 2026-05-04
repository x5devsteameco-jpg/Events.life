export const DEFAULT_FEATURE_FLAGS = [
  {
    key: 'frontierHeroV2',
    label: 'Frontier Hero Visuals',
    description: 'Enables the cinematic homepage hero treatment.',
    scope: 'marketing',
    enabled: true,
  },
  {
    key: 'eventAnalyticsAdvanced',
    label: 'Advanced Event Analytics',
    description: 'Enables deeper event analytics modules and exports.',
    scope: 'analytics',
    enabled: true,
  },
  {
    key: 'adminControlCenter',
    label: 'Admin Control Center',
    description: 'Enables expanded admin editing surfaces.',
    scope: 'admin',
    enabled: true,
  },
  {
    key: 'mobileBottomNav',
    label: 'Mobile Bottom Nav',
    description: 'Enables the mobile quick-action navigation bar.',
    scope: 'mobile',
    enabled: false,
  },
];

export const DEFAULT_AD_SLOTS = [
  {
    key: 'home_hero_promo',
    label: 'Homepage Hero Promo',
    headline: 'Launch immersive event pages faster',
    body: 'Promote premium templates, summit bundles, or sponsored campaigns.',
    ctaLabel: 'Explore packages',
    ctaHref: '/events',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    active: true,
    priority: 10,
  },
  {
    key: 'events_sidebar_spotlight',
    label: 'Events Sidebar Spotlight',
    headline: 'Featured host spotlight',
    body: 'Highlight marquee hosts, partner activations, or upcoming drops.',
    ctaLabel: 'Browse events',
    ctaHref: '/events',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    active: false,
    priority: 5,
  },
];

export const DEFAULT_SITE_ASSETS = [
  {
    key: 'home_hero_primary',
    label: 'Homepage Hero Primary Image',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80',
    alt: 'Premium networking event environment',
  },
  {
    key: 'home_visual_showcase_1',
    label: 'Visual Showcase Card 1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
    alt: 'Conference stage lighting and audience atmosphere',
  },
  {
    key: 'home_visual_showcase_2',
    label: 'Visual Showcase Card 2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1600&q=80',
    alt: 'VIP event lounge and nightlife program',
  },
];

export const DEFAULT_MANAGED_SECTIONS = [
  {
    pageKey: 'home',
    sectionKey: 'hero',
    label: 'Hero',
    variant: 'cinematic',
    enabled: true,
    sortOrder: 10,
    config: JSON.stringify({ density: 'high', visualDepth: 'orbital' }),
  },
  {
    pageKey: 'home',
    sectionKey: 'visual_showcase',
    label: 'Visual Showcase',
    variant: 'image-grid',
    enabled: true,
    sortOrder: 20,
    config: JSON.stringify({ cards: 4 }),
  },
  {
    pageKey: 'home',
    sectionKey: 'features',
    label: 'Feature Grid',
    variant: 'editorial-cards',
    enabled: true,
    sortOrder: 30,
    config: JSON.stringify({ columns: 3 }),
  },
  {
    pageKey: 'events',
    sectionKey: 'trending',
    label: 'Trending Events',
    variant: 'carousel',
    enabled: true,
    sortOrder: 10,
    config: JSON.stringify({ emphasized: true }),
  },
];
