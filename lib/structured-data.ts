import type { AppState } from "./types";

function absolute(origin: string, value: string) {
  if (!value) return undefined;
  try {
    return new URL(value, origin).toString();
  } catch {
    return undefined;
  }
}

/**
 * Structured data for a generated catering website. Search engines use this to
 * show the caterer's rating, service area, and menu directly in results.
 */
export function businessJsonLd(state: AppState, siteUrl: string, origin: string) {
  const { business, theme, testimonials, menuItems, categories, gallery, services } = state;
  const ratings = testimonials.filter(item => item.rating > 0);
  const images = [theme.heroImage, ...gallery.map(image => image.url)]
    .map(url => absolute(origin, url))
    .filter((url): url is string => Boolean(url))
    .slice(0, 6);

  const graph: Record<string, unknown>[] = [
    {
      "@type": ["Caterer", "LocalBusiness"],
      "@id": `${siteUrl}#business`,
      name: business.name,
      description: business.tagline || business.description || undefined,
      url: siteUrl,
      ...(business.email ? { email: business.email } : {}),
      ...(business.phone ? { telephone: business.phone } : {}),
      ...(images.length ? { image: images } : {}),
      ...(business.logo ? { logo: absolute(origin, business.logo) } : {}),
      ...(business.address || business.city
        ? {
            address: {
              "@type": "PostalAddress",
              ...(business.address ? { streetAddress: business.address } : {}),
              ...(business.city ? { addressLocality: business.city } : {}),
            },
          }
        : {}),
      ...(business.serviceAreas.length ? { areaServed: business.serviceAreas.map(area => ({ "@type": "Place", name: area })) } : {}),
      ...(business.foundedYear ? { foundingDate: business.foundedYear } : {}),
      ...(business.mapUrl ? { hasMap: business.mapUrl } : {}),
      ...(Object.values(business.social).some(Boolean) ? { sameAs: Object.values(business.social).filter(Boolean) } : {}),
      ...(ratings.length
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: (ratings.reduce((total, item) => total + item.rating, 0) / ratings.length).toFixed(1),
              reviewCount: ratings.length,
              bestRating: 5,
            },
          }
        : {}),
      ...(services.length
        ? {
            makesOffer: services.map(service => ({
              "@type": "Offer",
              name: service.title,
              ...(service.description ? { description: service.description } : {}),
            })),
          }
        : {}),
    },
  ];

  const availableItems = menuItems.filter(item => item.available);
  if (availableItems.length) {
    const sections = categories
      .map(category => ({
        "@type": "MenuSection",
        name: category.name,
        ...(category.description ? { description: category.description } : {}),
        hasMenuItem: availableItems
          .filter(item => item.categoryId === category.id)
          .map(item => ({
            "@type": "MenuItem",
            name: item.name,
            ...(item.description ? { description: item.description } : {}),
            ...(item.dietary.length ? { suitableForDiet: item.dietary } : {}),
          })),
      }))
      .filter(section => (section.hasMenuItem as unknown[]).length > 0);

    if (sections.length) {
      graph.push({ "@type": "Menu", "@id": `${siteUrl}#menu`, name: `${business.name} menu`, hasMenuSection: sections });
      (graph[0] as Record<string, unknown>).hasMenu = { "@id": `${siteUrl}#menu` };
    }
  }

  if (state.faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${siteUrl}#faq`,
      mainEntity: state.faqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
