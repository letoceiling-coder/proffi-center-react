import { Helmet } from 'react-helmet-async';

/**
 * Вставляет один или несколько JSON-LD скриптов в <head>.
 * @param {{ scripts: Array<object> }} props - scripts: массив объектов для JSON.stringify
 */
export default function JsonLd({ scripts }) {
  if (!Array.isArray(scripts) || scripts.length === 0) return null;
  return (
    <Helmet>
      {scripts.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}
