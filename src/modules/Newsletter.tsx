import { motion } from 'framer-motion';
import { useState } from 'react';
import { Newspaper, Plus, Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { news as initialNews } from '../data/content';
import { useLanguage } from '../hooks/useLanguage';
import { useDesignMode } from '../hooks/useDesignMode';
import { LeadCTA } from './Requests';
import { formatDate, cn } from '../lib/utils';

interface NewsletterProps {
  onLeadCapture: (module: string) => void;
}

export function Newsletter({ onLeadCapture }: NewsletterProps) {
  const { lang, t } = useLanguage();
  const { mode } = useDesignMode();
  const isEn = lang === 'en';
  const isEditorial = mode === 'editorial';
  const isBrutalist = mode === 'brutalist';
  const [news, setNews] = useState(initialNews);
  const [filter, setFilter] = useState<string>('all');

  const localizedNews = news.map((item) => {
    if (lang === 'en') return item;
    const categoryMap: Record<string, string> = {
      Milestones: t('newsletterContent.milestone'),
      'Office Life': t('newsletterContent.officeLife'),
      Events: t('newsletterContent.events'),
      Benefits: t('newsletterContent.benefits'),
      Business: t('newsletterContent.business'),
    };
    const byId: Record<string, { title: string; excerpt: string }> = {
      'n-1': { title: t('newsletterContent.n1Title'), excerpt: t('newsletterContent.n1Excerpt') },
      'n-2': { title: t('newsletterContent.n2Title'), excerpt: t('newsletterContent.n2Excerpt') },
      'n-3': { title: t('newsletterContent.n3Title'), excerpt: t('newsletterContent.n3Excerpt') },
      'n-4': { title: t('newsletterContent.n4Title'), excerpt: t('newsletterContent.n4Excerpt') },
      'n-5': { title: t('newsletterContent.n5Title'), excerpt: t('newsletterContent.n5Excerpt') },
    };
    return {
      ...item,
      title: byId[item.id]?.title ?? item.title,
      excerpt: byId[item.id]?.excerpt ?? item.excerpt,
      category: categoryMap[item.category] ?? item.category,
    };
  });

  const categories = ['all', ...Array.from(new Set(localizedNews.map((n) => n.category)))];
  const filtered = filter === 'all' ? localizedNews : localizedNews.filter((n) => n.category === filter);

  const addReaction = (newsId: string, emoji: string) => {
    setNews((prev) =>
      prev.map((n) => {
        if (n.id !== newsId) return n;
        const existing = n.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          return {
            ...n,
            reactions: n.reactions.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1 } : r),
          };
        }
        return {
          ...n,
          reactions: [...n.reactions, { emoji, count: 1 }],
        };
      })
    );
  };

  return (
    <div className="page-enter space-y-6">
      {isBrutalist ? (
        <div className="br-fade-in">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="br-tag" data-tone="accent">● NEWS</span>
            <span className="br-eyebrow">{t('newsletter.eyebrowBrutalist').toUpperCase()} · {news.length} {t('newsletter.posts').toUpperCase()}</span>
          </div>
          <h1 className="br-poster text-5xl md:text-7xl mb-4" style={{ lineHeight: 0.9 }}>
            {t('newsletter.headlineBrutalist')} <em className="br-italic">{t('newsletter.headlineEmBrutalist')}</em>
          </h1>
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--br-text-secondary)', letterSpacing: '-0.005em' }}>
            {t('newsletter.bodyBrutalist')}{' '}
            <span style={{ color: 'var(--br-accent)', fontWeight: 600 }}>{t('newsletter.bodyBrutalistAccent')}</span>
          </p>
          <hr className="br-divider mt-6" />
          <div className="flex gap-2 flex-wrap mt-4">
            <button className="br-btn">
              <Sparkles size={13} strokeWidth={2} />
              {t('newsletter.aiWrite').toUpperCase()}
            </button>
            <button className="br-btn br-btn-accent">
              <Plus size={13} strokeWidth={2} />
              {t('newsletter.newPost').toUpperCase()}
            </button>
          </div>
        </div>
      ) : isEditorial ? (
        <div className="ed-fade-in">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="ed-eyebrow">{t('newsletter.eyebrowEditorial')}</span>
            <span className="ed-tag" data-status="live">
              <span className="ed-pulse-dot"></span>
              {news.length} {t('newsletter.posts')}
            </span>
          </div>
          <h1 className="ed-display text-5xl md:text-6xl mb-3" style={{ lineHeight: 0.95 }}>
            {t('newsletter.headlineEditorial')} <em className="ed-italic-flourish">{t('newsletter.headlineEmEditorial')}</em>.
          </h1>
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--ed-text-secondary)' }}>
            {t('newsletter.bodyEditorial')}
          </p>
          <hr className="ed-divider mt-6" />
          <div className="flex gap-2 flex-wrap mt-4">
            <button className="ed-btn">
              <Sparkles size={13} strokeWidth={1.5} />
              {t('newsletter.aiWrite')}
            </button>
            <button className="ed-btn ed-btn-primary">
              <Plus size={13} strokeWidth={1.5} />
              {t('newsletter.newPost')}
            </button>
          </div>
        </div>
      ) : (
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-tertiary uppercase tracking-wider mb-1">{t('newsletter.eyebrowEditorial')}</p>
          <h1 className="font-display text-3xl">{t('newsletter.headlineClassic')}</h1>
          <p className="text-secondary text-sm mt-1">
            {news.length} {t('newsletter.bodyClassic')}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm">
            <Sparkles size={14} />
            {t('newsletter.aiWrite')}
          </button>
          <button className="btn-primary text-sm">
            <Plus size={14} />
            {t('newsletter.newPost')}
          </button>
        </div>
      </div>
      )}

      {/* Categories */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn('badge', filter === cat && 'badge-accent')}
          >
            {cat === 'all' ? t('newsletter.allCategory') : cat}
          </button>
        ))}
      </div>

      {/* News feed */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((item, i) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="card card-hover overflow-hidden"
          >
            {/* Hero */}
            <div className="relative -mx-6 -mt-6 mb-4 aspect-[2/1] flex items-center justify-center text-7xl mesh-bg">
              <div className="absolute inset-0 mesh-bg opacity-60" />
              <div className="relative">{item.emoji}</div>
            </div>

            <div className="flex items-center gap-2 text-xs text-tertiary mb-2">
              <span className="badge">{item.category}</span>
              <span>·</span>
              <span>{formatDate(item.date)}</span>
            </div>

            <h2 className="font-display text-xl leading-tight mb-2">{item.title}</h2>
            <p className="text-sm text-secondary leading-relaxed mb-4">{item.excerpt}</p>

            <div className="flex items-center justify-between pt-3 border-t border-subtle">
              <div className="flex items-center gap-2">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.author)}`}
                  className="w-6 h-6 rounded-full"
                  alt=""
                />
                <span className="text-xs text-tertiary">{item.author}</span>
              </div>

              <div className="flex items-center gap-1">
                {item.reactions.map((r) => (
                  <button
                    key={r.emoji}
                    onClick={() => addReaction(item.id, r.emoji)}
                    className="px-2 py-1 rounded-full bg-tertiary hover:bg-accent transition-colors text-xs flex items-center gap-1"
                  >
                    <span>{r.emoji}</span>
                    <span className="font-medium">{r.count}</span>
                  </button>
                ))}
                <button
                  onClick={() => addReaction(item.id, '🚀')}
                  className="px-2 py-1 rounded-full hover:bg-tertiary transition-colors"
                  title={isEn ? 'Add reaction' : 'Pridať reakciu'}
                >
                  <Plus size={12} className="text-tertiary" />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <LeadCTA module={isEn ? 'Company Newsletter' : 'Firemný Newsletter'} onLeadCapture={onLeadCapture} />
    </div>
  );
}
