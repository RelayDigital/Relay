"use client";
import React, { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import { ScrollSmoother } from "gsap";
import { useGlobalState } from "./GlobalStateContext";
import Marquee from "./Marquee";
import Image from "next/image";

const Hero = () => {
  const { heroContent } = useGlobalState();
  const { marqueeContent } = useGlobalState();
  const { isLoading } = useGlobalState();
  // const isLoading = useState(true);

  let mainMessage,
    highlightedText1,
    highlightedText2,
    Description,
    CTA,
    Decoration,
    Statistic,
    marqueeImages;

  if (heroContent) {
    ({
      mainMessage,
      highlightedText1,
      highlightedText2,
      Description,
      CTA,
      Decoration,
      Statistic,
    } = heroContent);
  }

  if (marqueeContent) {
    marqueeImages = marqueeContent.images.data.map(({ id, attributes }) => ({
      id,
      ...attributes,
      url: attributes.url, // adjust according to your actual API's URL structure
      alt: attributes.alternativeText || "Default Alt Text",
    }));
    console.log(marqueeImages[0].url);
  }

  // Function to replace highlighted texts
  const renderMainMessageText = (text, highlight1, highlight2) => {
    if (heroContent) {
      return {
        __html: text
          .replaceAll(
            highlight1,
            `<span className="text-blue-500">${highlight1}</span>`
          )
          .replaceAll(
            highlight2,
            `<span className="text-blue-500">${highlight2}</span>`
          ),
      };
    }
  };

  // GSAP Animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    let effectElements = gsap.utils.toArray("[data-speed]");
    effectElements.forEach((el) => {
      let speed = parseFloat(el.getAttribute("data-speed"));
      gsap.fromTo(
        el,
        { y: 0 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            onRefresh: (self) => {
              let start = Math.max(0, self.start); // ensure no negative values
              let distance = self.end - start;
              let end = start + distance / speed;
              self.setPositions(start, end);
              self.animation.vars.y = (end - start) * (1 - speed);
              self.animation.invalidate().progress(1).progress(self.progress);
            },
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [isLoading]); // Re-run when isLoading changes, to ensure animations are correctly initialized once the content is loaded

  return (
    <>
      <section className="relative mx-auto overflow-x-clip px-8 sm:px-16 md:px-24 lg:px-32">
        <div className="mb-6 mt-12 flex flex-col items-center text-center lg:mb-24 lg:mt-48 lg:grid lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-2 lg:mt-6 px-3">
              <div className="flex flex-col w-full h-full gap-3">
                <div className="skeleton h-7 lg:h-16 w-full"></div>
                <div className="skeleton h-7 lg:h-16 w-full"></div>
                <div className="skeleton h-7 lg:h-16 w-full"></div>
                <div className="skeleton h-7 lg:h-16 w-1/2"></div>
              </div>
            </div>
          ) : (
            <div className="col-span-2 z-20 lg:mt-6">
              <div className="-z-10 max-w-4xl text-center font-melodrama text-3xl sm:text-5xl lg:text-start lg:text-7xl">
                <h1
                  className="bg-gradient-to-br from-neutral-100 from-55% to-neutral-500 bg-clip-text font-medium tracking-tight text-transparent lg:min-h-[20rem] lg:to-neutral-600"
                  data-speed="0.5"
                  // dangerouslySetInnerHTML={renderMainMessageText(
                  //   mainMessage,
                  //   highlightedText1,
                  //   highlightedText2
                  // )}
                >
                  Get <span className="text-blue-500">3.7x</span> More Out Of
                  Your Ads, with the #1 High Performance{" "}
                  <span className="text-blue-500">Marketing Funnels</span>.
                </h1>
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="col-span-1 flex flex-col items-start justify-between gap-y-8 py-12 text-start lg:h-full w-[475px]">
              <div className="flex flex-col gap-1 w-full">
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-1/2"></div>
              </div>
              <div className="skeleton h-[82px] w-1/2"></div>
            </div>
          ) : (
            <div className="col-span-1 z-20 flex flex-col items-start justify-between gap-y-8 py-12 text-start lg:h-full">
              <div
                className="text-center text-base leading-tight text-neutral-300 lg:text-start"
                data-speed="0.7"
              >
                {/* <div>{Description}</div> */}
                Relay is a modern development studio specialising in high
                converting marketing funnels. We design, develop and deploy high
                performance, lightning-fast landing pages that will sky-rocket
                your conversion rate.
              </div>
              <div
                className="block w-full justify-center md:flex md:flex-row lg:justify-start"
                data-speed="0.8"
              >
                <a href="/contact">
                  <button className="relative rounded-full text-center transition-all duration-500 transform overflow-hidden z-40   w-full px-8 py-6 text-base bg-blue-500 text-neutral-950 border border-blue-500 button hover:text-neutral-50 group text-xl uppercase md:text-2xl">
                    <div className="flex flex-row group relative z-10 w-full justify-center">
                      Let&apos;s Chat
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                        className="ml-2 inline-block"
                      >
                        <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"></path>
                      </svg>
                    </div>
                  </button>
                </a>
              </div>
            </div>
          )}
          <div
            className="absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] lg:w-max flex justify-center"
            data-speed="0.6"
          >
            <img
              src="/svg/hero-circle.svg/"
              alt="circle background"
              loading="eager"
              className="h-auto w-[24rem] lg:w-[38rem]"
              width="516"
              height="516"
              decoding="async"
            />
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {isLoading ? (
          <div className="skeleton h-[143px] w-[862px]"></div>
        ) : (
          <dl
            className="relative z-40 mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-neutral-600 bg-neutral-600 text-center shadow-2xl shadow-blue-500/50 lg:grid-cols-4"
            data-speed="1.05"
          >
            <div className="flex flex-col items-center  justify-center bg-neutral-900 px-2 py-6">
              <dt className="mt-1 text-sm font-normal leading-tight tracking-tight text-neutral-300">
                {/* {Statistic[0].description} */}
                Average Conversion Rate Boost
              </dt>
              <dd className="order-first font-melodrama text-5xl font-semibold tracking-tight text-white lg:text-5xl">
                {/* {Statistic[0].value} */}
                22%
              </dd>
            </div>
            <div className="flex flex-col items-center  justify-center bg-neutral-900 px-2 py-6">
              <dt className="mt-1 text-sm font-normal leading-tight tracking-tight text-neutral-300">
                {/* {Statistic[1].description} */}
                More Time Spent on Page
              </dt>
              <dd className="order-first font-melodrama text-5xl font-semibold tracking-tight text-white lg:text-5xl">
                {/* {Statistic[1].value} */}
                60%
              </dd>
            </div>
            <div className="flex flex-col items-center  justify-center bg-neutral-900 px-2 py-6">
              <dt className="mt-1 text-sm font-normal leading-tight tracking-tight text-neutral-300">
                {/* {Statistic[2].description} */}
                Faster Than Typical Websites
              </dt>
              <dd className="order-first font-melodrama text-5xl font-semibold tracking-tight text-white lg:text-5xl">
                {/* {Statistic[2].value} */}
                10x
              </dd>
            </div>
            <div className="flex flex-col items-center  justify-center bg-neutral-900 px-2 py-6">
              <dt className="mt-1 text-sm font-normal leading-tight tracking-tight text-neutral-300">
                {/* {Statistic[3].description} */}
                Average Ad ROI Increase
              </dt>
              <dd className="order-first font-melodrama text-5xl font-semibold tracking-tight text-white lg:text-5xl">
                {/* {Statistic[3].value} */}
                39%
              </dd>
            </div>
          </dl>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-row w-[400%] overflow-x-hidden gap-10">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="skeleton sm:h-54 h-48 w-auto rounded-lg border border-neutral-700 lg:h-72"
              style={{ width: "471px", height: "286px" }} // Adjusted for consistent sizing
            ></div>
          ))}
        </div>
      ) : (
        <Marquee speed={1}>
          <img
            src="/img/homezy.webp"
            alt="Homezy"
            className="sm:h-54 h-48 w-auto rounded-lg border border-neutral-700 grayscale-[50%] lg:h-72"
            loading="eager"
            width="1728"
            height="992"
            decoding="async"
          />
          <img
            src="/img/thai.webp"
            alt="Thai"
            className="sm:h-54 h-48 w-auto rounded-lg border border-neutral-700 grayscale-[50%] lg:h-72"
            loading="eager"
            width="1728"
            height="992"
            decoding="async"
          />
          <img
            src="/img/wellbeing.webp"
            alt="WellBeing"
            className="sm:h-54 h-48 w-auto rounded-lg border border-neutral-700 grayscale-[50%] lg:h-72"
            loading="eager"
            width="3456"
            height="1984"
            decoding="async"
          />
          <img
            src="/img/agenci.webp"
            alt="Agenci"
            className="sm:h-54 h-48 w-auto rounded-lg border border-neutral-700 grayscale-[50%] lg:h-72"
            loading="eager"
            width="1728"
            height="992"
            decoding="async"
          />
          <img
            src="/img/joyfolio.webp"
            alt="Joyfolio"
            className="sm:h-54 h-48 w-auto rounded-lg border border-neutral-700 grayscale-[50%] lg:h-72"
            loading="eager"
            width="1728"
            height="992"
            decoding="async"
          />
          <img
            src="/img/inspire.webp"
            alt="Inspire"
            className="sm:h-54 h-48 w-auto rounded-lg border border-neutral-700 grayscale-[50%] lg:h-72"
            loading="eager"
            width="1728"
            height="992"
            decoding="async"
          />
          <img
            src="/img/wellbeing.webp"
            alt="WellBeing"
            className="sm:h-54 h-48 w-auto rounded-lg border border-neutral-700 grayscale-[50%] lg:h-72"
            loading="eager"
            width="3456"
            height="1984"
            decoding="async"
          />
          <img
            src="/img/fashion.webp"
            alt="Fashion"
            className="sm:h-54 h-48 w-auto rounded-lg border border-neutral-700 grayscale-[50%] lg:h-72"
            loading="eager"
            width="2456"
            height="1491"
            decoding="async"
          />
          <img
            src="/img/requesto.webp"
            alt="Request"
            className="sm:h-54 h-48 w-auto rounded-lg border border-neutral-700 grayscale-[50%] lg:h-72"
            loading="eager"
            width="1728"
            height="992"
            decoding="async"
          />
          <img
            src="/img/darkstudio.webp"
            alt="Studio"
            className="sm:h-54 h-48 w-auto rounded-lg border border-neutral-700 grayscale-[50%] lg:h-72"
            loading="eager"
            width="1728"
            height="992"
            decoding="async"
          />
        </Marquee>
      )}
    </>
  );
};

export default Hero;
