import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function GalleryBlock({ data, entityMedia }) {
  const items = entityMedia?.gallery?.length
    ? entityMedia.gallery.map((m) => ({ image: m.url, title: m.alt || m.caption || '' }))
    : (data.items || []).map((it) => ({ image: it.url || it.image, title: it.title || it.alt || '' }));
  if (!items.length) return null;
  return (
    <div className="section block-gallery">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="carousel-gallery" style={{ maxWidth: 600, margin: '0 auto' }}>
              <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{
                  prevEl: '.block-gallery .swiper-button-prev',
                  nextEl: '.block-gallery .swiper-button-next',
                }}
                className="swiper-gallery"
              >
                {items.map((item, i) => (
                  <SwiperSlide key={i}>
                    <div className="item">
                      <img src={item.image} alt={item.title} />
                      {item.title && <p>{item.title}</p>}
                    </div>
                  </SwiperSlide>
                ))}
                <div className="swiper-button-prev" aria-label="Назад" />
                <div className="swiper-button-next" aria-label="Вперёд" />
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
