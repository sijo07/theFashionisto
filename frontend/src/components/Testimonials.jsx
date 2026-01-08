import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const Testimonials = () => {
  const testimonials = [
    {
      name: "John Doe",
      quote: "Great Collections!",
      image: "/assets/unsplash-2.jpg",
    },
    {
      name: "Jane Smith",
      quote: "Amazing quality and service!",
      image: "/assets/banner.webp",
    },
    {
      name: "Sam Wilson",
      quote: "Highly recommend to everyone!",
      image: "/assets/unsplash-1.jpg",
    },
  ];

  return (
    <div className="mt-8 bg-gray-100 py-10">
      <h2 className="text-center text-3xl font-bold text-[#649899] mb-6">
        What Our Customers Say
      </h2>
      <Carousel
        showThumbs={false}
        infiniteLoop={true}
        autoPlay={true}
        interval={5000}
        showStatus={false}
      >
        {testimonials.map((testimonial, index) => (
          <div key={index} className="flex flex-col items-center">
            <img
              src={testimonial.image}
              alt={`${testimonial.name}`}
              className="rounded-full w-24 h-[24rem] mb-4 object-cover"
            />
            <p className="text-xl italic text-center mb-2">
              {testimonial.quote}
            </p>
            <p className="font-bold text-lg text-[#649899]">
              {testimonial.name}
            </p>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Testimonials;
