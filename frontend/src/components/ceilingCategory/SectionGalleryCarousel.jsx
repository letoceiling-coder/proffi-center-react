/**
 * Галерея-карусель на странице категории (s_gallery gallerry_page, carousel-gallery2).
 */

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function SectionGalleryCarousel({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="section s_gallery gallerry_page">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            <div className="carousel-gallery2" style={{ width: '90%', margin: '0 auto' }}>
              <Swiper
                modules={[Navigation]}
                spaceBetween={10}
                slidesPerView={2}
                navigation
                breakpoints={{ 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
                className="swiper-gallery2"
              >
                {items.map((item, i) => (
                  <SwiperSlide key={i}>
                    <div className="item">
                      <img src={item.src} alt={item.alt || ''} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
