const Hero = () => {
  return (
    <>
      <section className="px-3  bg-white">
        <div className="grid lg:grid-cols-2 items-center justify-items-center gap-5 pt-3">
          <div className="flex flex-col justify-center items-center">
            <h2 className="w-full text-center text-4xl font-bold md:7xl capitalize text-teal-800">
              New, Amazing
            </h2>
            <p className="w-full text-center text-4xl font-bold md:7xl capitalize text-teal-800">
              stuff is here!
            </p>
            <p className="mt-2 text-sm md:text-lg capitalize text-neutral-400 font-normal italic">
              shop today and get&nbsp;
              <span className="text-neutral-500 font-semibold not-italic lining-nums">
                30% discount
              </span>
            </p>
            <button className="rounded-r-3xl shadow shadow-black/60 bg-teal-900 hover:bg-teal-700 m-2 lg:py-2 py-1 lg:px-3.5 px-2 text-sm capitalize text-white hover:scale-105 duration-200">
              <a href="#top"> shop now</a>
            </button>
            <div className="justify-evenly mt-10 items-center flex">
              <hr className="lg:w-[6rem]  lg:border-2 border-teal-900" />
              <h1 className="ml-4 mt- w-[27rem] text-teal-800 font-bold uppercase tracking-wider">
                Do &nbsp;well, live &nbsp;well, and dress really &nbsp;well
              </h1>
              <hr className="lg:w-[6rem] lg:border-2 border-teal-900" />
            </div>
          </div>
          <div>
            <img
              className="h-80 w-80 object-cover lg:w-[100%] lg:h-[560px]"
              src="assets/cover.png"
              alt="Hero"
            />
          </div>
        </div>
      </section>
    </>
  );
};
export default Hero;
