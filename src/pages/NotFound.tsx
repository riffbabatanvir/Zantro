import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <>
      <Helmet>
        <title>Page Not Found — Zantro</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-black/30 dark:text-white/30 mb-4">404</p>
        <h1 className="text-5xl font-light tracking-tight text-black dark:text-white mb-4">Page Not Found</h1>
        <p className="text-sm text-black/40 dark:text-white/40 mb-10 max-w-xs">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="text-[11px] font-medium uppercase tracking-[0.2em] text-black dark:text-white border-b border-black dark:border-white pb-1 hover:text-black/60 dark:hover:text-white/60 hover:border-black/20 dark:hover:border-white/20 transition-all"
        >
          {t('Back to Home')}
        </Link>
      </div>
    </>
  );
}
