import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  schema = null,
}) => {
  const siteName = 'Janki Jiyana House';
  const defaultTitle = `${siteName} | Baby Care & Personal Hygiene Store Surat`;
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;

  const defaultDescription =
    'Shop premium baby care items, baby diaper pants, adult pull-up diapers, sanitary napkins, and kids wear at Janki Jiyana House Surat. Fast delivery & discreet packaging.';
  const metaDescription = description || defaultDescription;

  const defaultKeywords =
    'Janki Jiyana House, baby care store Surat, baby diapers, adult diapers Surat, sanitary pads, pull up diapers, hygiene products Surat, kids clothing Surat';
  const metaKeywords = keywords || defaultKeywords;

  const currentUrl = canonical || (typeof window !== 'undefined' ? window.location.href : 'https://janki-jiyana-house.vercel.app');
  const defaultOgImage = typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : 'https://janki-jiyana-house.vercel.app/logo.png';

  const metaOgImage = ogImage || defaultOgImage;

  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph Meta Tags (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={metaOgImage} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaOgImage} />

      {/* Structured Data (JSON-LD) for Google Search Rich Results */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
