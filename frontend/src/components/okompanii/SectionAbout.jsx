/**
 * Секция «О компании» (s_about): заголовок, текст, карусель фото.
 * Разметка 1 в 1 как в шаблоне o-kompanii.html.
 */
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function SectionAbout({ data, carouselItems }) {
  return (
    <section className="section s_about">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            <h1 className="">{data.title}</h1>
            {data.paragraphs.map((text, i) => (
              <p key={i} className="light">{text}</p>
            ))}
            <div className="carousel_about owl-reponsive">
              <Swiper
                modules={[Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                pagination={{ clickable: true }}
                className="swiper-about"
                style={{ marginTop: 30 }}
              >
                {carouselItems.map((item) => (
                  <SwiperSlide key={item.id}>
                    <div className="item">
                      <div className="item_block">
                        <img src={item.image} alt="" />
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
