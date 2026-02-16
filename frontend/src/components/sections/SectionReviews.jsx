import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function SectionReviews({ items = [], allReviewsLink = '/natyazhnyye-potolki-otzyvy' }) {
  return (
    <div className="section s_otz_car">
      <div className="container">
        <div className="row">
          <div className="col-md-12 clearfix">
            <div className="ttl">Отзывы наших заказчиков</div>
            <div className="otz_carousel">
              <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{
                  prevEl: '.s_otz_car .swiper-button-prev',
                  nextEl: '.s_otz_car .swiper-button-next',
                }}
                className="swiper-reviews"
                style={{ maxWidth: 750, margin: '30px auto 0' }}
              >
                {items.map((item, i) => (
                  <SwiperSlide key={i}>
                    <div className="item">
                      <div className="i_otz">
                        <img src={item.avatar} alt="" />
                      </div>
                      <div className="otz_name">{item.name}</div>
                      <div className="otz_prof">{item.profession}</div>
                      <div className="otzyv">{item.text}</div>
                    </div>
                  </SwiperSlide>
                ))}
                <div className="swiper-button-prev" aria-label="Назад" />
                <div className="swiper-button-next" aria-label="Вперёд" />
              </Swiper>
              <div className="otz_link">
                <Link to={allReviewsLink}>ВСЕ ОТЗЫВЫ</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
