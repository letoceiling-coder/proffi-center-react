import { useParams } from 'react-router-dom';
import { CEILING_CATEGORY_SLUGS } from '../data/ceilingCategoriesData';
import CeilingCategoryPage from './CeilingCategoryPage';
import ApiPageBySlugPage from './ApiPageBySlugPage';

/**
 * Для slug из меню «типы потолков» (matovye-potolki и т.д.) — CeilingCategoryPage (статичный контент).
 * Для остальных — ApiPageBySlugPage (страницы из CMS).
 */
export default function PageBySlugSwitch() {
  const { slug } = useParams();
  if (slug && CEILING_CATEGORY_SLUGS.includes(slug)) {
    return <CeilingCategoryPage slugOverride={slug} />;
  }
  return <ApiPageBySlugPage />;
}
