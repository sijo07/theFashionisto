import { Link } from "react-router-dom";
const Hero = () => {
  return (
    <>
      <section className="bg-white">
        <div className="flex justify-around items-center px-6 py-20">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold text-teal-800 mb-4">
              New, Amazing Stuff Is Here!
            </h2>
            <p className="text-lg text-gray-500 mb-6">
              Shop Today And Get <span className="font-bold">30% Discount</span>
            </p>
            <Link to="/shop">
              <button className="bg-[#649899] text-white px-6 py-2 rounded-full hover:bg-[#649970]">
                Shop now
              </button>
            </Link>
            <div className="mt-10 text-teal-800 font-semibold tracking-widest">
              Do Well, Live Well, And Dress Really Well.
            </div>
          </div>
          <div>
            <img
              src="/assets/cover.png"
              alt="Fashion Model"
              className="h-80 w-80 object-cover lg:w-[100%] lg:h-[560px]"
            />
          </div>
        </div>
      </section>
    </>
  );
};
export default Hero;
