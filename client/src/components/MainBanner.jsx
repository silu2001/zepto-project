import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const MainBanner = () => {
  return (
    <div className="relative w-full">

      {/* Background Images */}
      <img
        src={assets.main_banner_bg}
        alt="banner"
        className="w-full hidden md:block"
      />
      <img
        src={assets.main_banner_bg_sm}
        alt="banner"
        className="w-full md:hidden"
      />

      {/* Banner Content */}
      <div
        className="absolute inset-0 flex flex-col items-center md:items-start 
        justify-end md:justify-center pb-20 md:pb-0 px-4 md:pl-16 lg:pl-24"
      >
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold 
          text-center md:text-left max-w-xs md:max-w-md leading-tight"
        >
          Freshness You Can Trust, Savings You’ll Love!
        </h1>

        {/* Buttons */}
        <div className="flex items-center gap-6 mt-6 font-medium">
          <Link
            to="/products"
            className="group flex items-center gap-2 px-7 md:px-9 py-3 
            bg-[#4fbf8b] hover:bg-[#44ae7c] transition rounded text-white"
          >
            Shop now
            <img
              className="md:hidden transition group-hover:translate-x-1"
              src={assets.white_arrow_icon}
              alt="arrow"
            />
          </Link>

          <Link
            to="/products"
            className="group hidden md:flex items-center gap-2 px-9 py-3"
          >
            Explore deals
            <img
              className="transition group-hover:translate-x-1"
              src={assets.black_arrow_icon}
              alt="arrow"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainBanner;
