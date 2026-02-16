import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function SectionGallery({ items = [] }) {
  return (
    <div className="section s_gallery">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            <div className="carousel-gallery" style={{ width: '600px', margin: '0 auto' }}>
              <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{
                  prevEl: '.s_gallery .swiper-button-prev',
                  nextEl: '.s_gallery .swiper-button-next',
                }}
                className="swiper-gallery"
                style={{ maxWidth: 600, margin: '0 auto' }}
              >
                {items.map((item, i) => (
                  <SwiperSlide key={i}>
                    <div className="item">
                      <img src={item.image} alt={item.title} />
                      <p>{item.title}</p>
                      <div className="flex">
                        <p>Стоимость:</p>
                        <span>{item.price}</span>
                        <span><i className="rub4" /></span>
                      </div>
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
