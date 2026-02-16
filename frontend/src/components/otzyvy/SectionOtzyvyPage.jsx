/**
 * Секция страницы отзывов (s24): список отзывов слева, форма «Оставьте отзыв» справа.
 * Форма фиксируется при скролле (как lockfixed в оригинале).
 */
import { useRef, useEffect, useState } from 'react';
import OtzyvBlock from './OtzyvBlock';
import SectionOtzyvyForm from './SectionOtzyvyForm';

export default function SectionOtzyvyPage({ reviews, legalLink }) {
  const leftRef = useRef(null);
  const rightStickyWrapRef = useRef(null);
  const [stickyHeight, setStickyHeight] = useState(0);

  useEffect(() => {
    const left = leftRef.current;
    const wrap = rightStickyWrapRef.current;
    if (!left || !wrap) return;

    const updateHeight = () => {
      const h = left.offsetHeight;
      if (h > 0) setStickyHeight(h);
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(left);

    return () => ro.disconnect();
  }, [reviews]);

  return (
    <section className="section s24">
      <div className="content">
        <div className="otz_page clearfix">
          <div className="col-lg-6 col-lg-offset-1 clearfix">
            <div className="otz_left" ref={leftRef}>
              {reviews.map((item) => (
                <OtzyvBlock key={item.id} item={item} />
              ))}
            </div>
          </div>
          <div className="col-lg-5 clearfix">
            <div className="otz_right">
              <div
                className="otz_right_sticky_wrap"
                ref={rightStickyWrapRef}
                style={stickyHeight ? { minHeight: stickyHeight } : undefined}
              >
                <SectionOtzyvyForm legalLink={legalLink} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
