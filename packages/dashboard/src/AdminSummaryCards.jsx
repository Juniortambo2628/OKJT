import { motion } from 'framer-motion';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import DashboardIcon from './DashboardIcon.js';
import { useComponentDefaults } from './DashboardProvider.js';

// Phones: two per row. From tablets up, one row when the cards fit (so four
// cards never leave one alone on a second row).
const gridColumns = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-3 xl:grid-cols-5',
  6: 'md:grid-cols-3 xl:grid-cols-6',
};

/**
 * AdminSummaryCards — compact overview stat cards for admin pages.
 *
 * @param {Array} cards - Array of {
 *     label, value, icon: LucideIcon, color,
 *     hint?: string       — secondary line (e.g. "64% of invited"),
 *     onClick?: function  — makes the card a button (e.g. apply a filter),
 *     active?: boolean    — highlights the card (e.g. its filter is applied),
 *   }
 * @param {number} [columns=4] - Number of columns on large screens (1-6)
 *
 * variant="bold" (or componentDefaults.SummaryCards): large glass cards, the
 * label over a big figure, the icon on the right, and an optional `trend`
 * (percent vs. last month). Icons may be names (iconFor). Its columns default
 * to the card count (at most 4); `stackOnPhones` puts one card per row on
 * phones (for wide figures such as amounts).
 */
export default function AdminSummaryCards(ownProps) {
  const { variant = 'plain', ...props } = useComponentDefaults('SummaryCards', ownProps);
  return variant === 'bold' ? <BoldSummaryCards {...props} /> : <PlainSummaryCards {...props} />;
}

function PlainSummaryCards({ cards = [], columns = 4 }) {
  if (!cards.length) return null;

  const gridCols = gridColumns[columns] || gridColumns[4];
  // Six/five-up cards are too narrow for an icon between xl and 2xl.
  const iconVisibility = columns >= 5 ? 'flex xl:hidden 2xl:flex' : 'flex';

  return (
    <div className={`grid grid-cols-2 ${gridCols} gap-3 lg:gap-4`}>
      {cards.map((stat, index) => {
        const Icon = stat.icon;
        const Tag = stat.onClick ? motion.button : motion.div;
        return (
          <Tag
            key={stat.label}
            type={stat.onClick ? 'button' : undefined}
            onClick={stat.onClick}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            aria-pressed={stat.onClick ? !!stat.active : undefined}
            className={`px-3.5 py-3 rounded-2xl bg-surface flex items-center gap-3 text-left min-w-0 transition-shadow ${
              stat.onClick ? 'cursor-pointer hover:ring-2 hover:ring-accent/20' : ''
            } ${stat.active ? 'ring-2 ring-accent/50' : ''}`}
            style={{ boxShadow: '0 4px 20px color-mix(in srgb, var(--color-accent) 8%, transparent)' }}
          >
            <div
              className={`w-9 h-9 rounded-xl items-center justify-center shrink-0 ${iconVisibility}`}
              style={{ background: `${stat.color}15` }}
            >
              {Icon && <Icon className="w-5 h-5" style={{ color: stat.color }} />}
            </div>
            <div className="min-w-0">
              <p className="text-xl font-semibold leading-tight text-body">
                {stat.value}
              </p>
              <p className="text-sm text-muted leading-snug line-clamp-2">
                {stat.label}
              </p>
              {stat.hint && (
                <p className="text-xs text-tone-400 truncate" title={stat.hint}>
                  {stat.hint}
                </p>
              )}
            </div>
          </Tag>
        );
      })}
    </div>
  );
}

// Bold: phones two per row (one for a single card); from tablets up one row
// when the cards fit, so four never leave one alone on a second row.
const boldColumns = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 xl:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
};

function BoldSummaryCards({ cards = [], columns, stackOnPhones = false }) {
  if (!cards.length) return null;
  let cols = boldColumns[columns ?? Math.min(cards.length, 4)] || boldColumns[4];
  const compact = (columns ?? cards.length) >= 5;
  if (stackOnPhones) cols = cols.replace(/^grid-cols-2\b/, 'grid-cols-1 sm:grid-cols-2');

  return (
    <div className={`grid gap-3 lg:gap-4 ${cols}`}>
      {cards.map((card) => <BoldStatCard key={card.label} compact={compact} {...card} />)}
    </div>
  );
}

/**
 * One large figure. With `onClick` the card is a button (e.g. it applies a
 * filter) and `active` marks it pressed. `compact` suits rows of five or six:
 * a smaller figure, and no icon where the cards are too narrow for one.
 */
export function BoldStatCard({ icon, label, value, trend, hint, onClick, active = false, compact = false }) {
  const up = trend > 0;
  const down = trend < 0;
  const trendColor = up ? 'text-emerald-300' : down ? 'text-accent-dark' : 'text-tone-500';

  const Tag = onClick ? 'button' : 'div';
  const interactive = onClick ? 'w-full text-left transition hover:border-accent-dark/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong/60' : '';
  const pressed = active ? 'border-accent-strong/50 ring-1 ring-accent-strong/40' : '';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      className={`block rounded-2xl border border-tone-100 bg-surface backdrop-blur-xl ${compact ? 'p-4 2xl:p-5' : 'p-5 sm:p-6'} ${interactive} ${pressed}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-sm text-tone-500">{label}</p>
          <p className={`truncate font-semibold tracking-tight text-ink ${compact ? 'text-xl 2xl:text-2xl' : 'text-2xl sm:text-3xl'}`} title={typeof value === 'string' ? value : undefined}>{value}</p>
          {hint && <p className="mt-1 truncate text-xs text-tone-400" title={hint}>{hint}</p>}
          {trend !== undefined && trend !== null && (
            <div className="mt-3 flex items-center gap-1.5">
              <DashboardIcon
                icon={up ? 'trend-up' : down ? 'trend-down' : 'trend-flat'}
                fallback={up ? TrendingUp : down ? TrendingDown : Minus}
                className={`${trendColor} text-[10px]`}
              />
              <span className={`text-xs font-medium ${trendColor}`}>{Math.abs(trend)}%</span>
              <span className="text-xs text-contrast/35">vs. last month</span>
            </div>
          )}
        </div>
        <div className={`h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-soft/10 bg-action/30 ${compact ? 'flex xl:hidden 2xl:flex' : 'flex'}`}>
          <DashboardIcon icon={icon} className="text-base text-accent-soft" />
        </div>
      </div>
    </Tag>
  );
}
