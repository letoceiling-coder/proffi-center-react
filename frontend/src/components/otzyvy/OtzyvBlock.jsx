/**
 * Один блок отзыва на странице отзывов (s24 .otz_block).
 * Разметка 1 в 1 как в шаблоне natyazhnyye-potolki-otzyvy.html.
 */
import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function OtzyvBlock({ item }) {
  const { name, date, text, images } = item;
  const hasImages = images && images.length > 0;
  const swiperInstanceRef = useRef(null);

  const handleImageLoad = () => {
    const swiper = swiperInstanceRef.current;
    if (!swiper) return;
    const update = () => {
      swiper.update();
      swiper.updateSize();
      if (typeof swiper.updateAutoHeight === 'function') {
        swiper.updateAutoHeight();
      }
    };
    update();
    requestAnimationFrame(update);
  };

  return (
    <div className="otz_block">
      <div className="otz_head clearfix">
        <div className="otz_name">{name}</div>
        <div className="otz_date">{date}</div>
        <div className="clr" />
      </div>
      <div className="otz_text">{text}</div>
      {hasImages && (
        <div className="otz_block_carousel otz_left">
          <Swiper
            onSwiper={(swiper) => { swiperInstanceRef.current = swiper; }}
            modules={[Pagination]}
            spaceBetween={8}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoHeight
            observer
            observeParents
            observeSlideChildren
            className="swiper-otz-images swiper-autoheight"
          >
            {images.map((src, i) => (
              <SwiperSlide key={i}>
                <img src={src} alt="" onLoad={handleImageLoad} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
}
