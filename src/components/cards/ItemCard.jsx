import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ItemImage } from '../ItemImage.jsx';
import { itemHasImage } from '../../lib/assets.js';
import { TagPill } from '../TagPill.jsx';
import { itemPath, preferencePath } from '../../lib/routes.js';
import { ItemMetaPills } from '../ItemCategoryPill.jsx';
import { useNavigationBackState } from '../../hooks/useNavigationBackState.js';

export function ItemCard({ item, index = 0, preferences }) {
  const linkState = useNavigationBackState();

  return (
    <motion.article
      className="item-card card-cozy"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4) }}
    >
      <div className="item-card__inner">
        <Link to={itemPath(item)} state={linkState} className="item-card__main">
          <div className="item-card__thumb">
            {itemHasImage(item) ? (
              <ItemImage item={item} loading="lazy" />
            ) : (
              <span className="item-card__placeholder" aria-hidden>
                ?
              </span>
            )}
          </div>
          <div className="item-card__body">
            <p className="item-card__name">{item.name}</p>
            <ItemMetaPills item={item} className="item-card__kind" />
          </div>
        </Link>
        {preferences?.length > 0 && (
          <div className="item-card__prefs">
            {preferences.map((pref) => (
              <Link
                key={pref.slug}
                to={preferencePath({ id: pref.slug }, 'items')}
                className="item-card__pref-link"
              >
                <TagPill variant="pref" className="item-card__pref">
                  {pref.displayName}
                  {pref.category ? (
                    <span className="item-card__pref-cat"> · {pref.category}</span>
                  ) : null}
                </TagPill>
              </Link>
            ))}
          </div>
        )}
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="item-card__guide"
          >
            View on guide ↗
          </a>
        )}
      </div>
    </motion.article>
  );
}
