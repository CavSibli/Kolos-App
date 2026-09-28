import { Helmet } from 'react-helmet-async';

type PageMetaProps = {
  title: string;
  description: string;
  path?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
};

const SITE_NAME = 'Kolos';
const DEFAULT_ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : 'https://kolos.app';

export function PageMeta({
  title,
  description,
  path = '/',
  ogType = 'website',
  noIndex = false,
}: PageMetaProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
  const url = `${DEFAULT_ORIGIN}${path}`;

  return (
    <Helmet>
      <html lang="fr" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex ? <meta name="robots" content="noindex,nofollow" /> : null}
      <link rel="canonical" href={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="fr_FR" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
