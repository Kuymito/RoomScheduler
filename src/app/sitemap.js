// src/app/sitemap.js

export default function sitemap() {
  return [
    {
      url: 'https://num-digital-scheduler.fit',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://num-digital-scheduler.fit/signin',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // You can add more public URLs here later
  ];
}