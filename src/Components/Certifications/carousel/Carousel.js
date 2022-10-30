import React, { useEffect, useState } from "react";
import classes from "./Carousel.module.scss";
import GoldButton from "../../../UI/GoldButton/GoldButton";

const Carousel = (props) => {
  const [certData] = useState(props.dataCert);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselInfiniteScroll = () => {
    if (currentIndex === certData.length - 1) {
      return setCurrentIndex(0);
    }
    return setCurrentIndex(currentIndex + 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      carouselInfiniteScroll();
    }, 8000);

    return () => clearInterval(interval);
  });

  const toLeft = () => {
    if (currentIndex > certData.length - 1) {
      return setCurrentIndex(0);
    }
    if (currentIndex < 0) {
      return setCurrentIndex(certData.length - 1);
    }
    return setCurrentIndex(currentIndex - 1);
  };

  const toRight = () => {
    if (currentIndex >= certData.length - 1) {
      return setCurrentIndex(0);
    }
    if (currentIndex < 0) {
      return setCurrentIndex(certData.length - 1);
    }
    return setCurrentIndex(currentIndex + 1);
  };

  return (
    <>
      <div className={classes.carousel__container}>
        {certData.map((item, index) => {
          return (
            <div
              className={classes.carousel__item}
              style={{ transform: `translate(-${currentIndex * 100}%)` }}
              key={index}
            >
              <div className={classes.carousel__wrapper}>
                <img
                  className={classes.carousel__img}
                  src={item.img}
                  alt="certification"
                />
                <h3 className={classes.carousel__certTitle}>{item.title}</h3>
              </div>
            </div>
          );
        })}
      </div>
      <ul className={classes.carousel__control}>
        <li>
          <GoldButton action={toLeft} company={"<"} />
        </li>
        <li>
          <GoldButton action={toRight} company={">"} />
        </li>
      </ul>
    </>
  );
};

export default Carousel;
