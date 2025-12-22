import { FaEnvelope, FaTwitter, FaInstagram, FaPhone } from "react-icons/fa";

const Contact = () => {
  return (
    <>
      <div className="w-full lg:py-12 py-12 ">
        <div className="lg:w-3/5 mx-auto text-center">
          <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="flex-1 bg-teal-800 text-white py-12 lg:py-24 px-8 lg:px-16 flex flex-col items-center justify-center">
              <h2 className="text-2xl lg:text-4xl font-extrabold mb-4">
                We&apos;d Love to Hear From You
              </h2>
              <p className="text-lg lg:text-xl mb-6">
                Get in touch with us for any queries or feedback!
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/vida_magicah?igshid=MzNlNGNkZWQ4Mg=="
                  className="text-white border-2 p-2 rounded-2xl hover:bg-white hover:text-teal-700 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <FaInstagram size={28} />
                </a>
                <a
                  href="https://twitter.com/i/flow/login"
                  className="text-white border-2 p-2 hover:bg-white  rounded-2xl hover:text-teal-700 transition-colors duration-300"
                  aria-label="Twitter"
                >
                  <FaTwitter size={26} />
                </a>
                <a
                  href="mailto:thefashionisto@gmail.com"
                  className="text-white border-2 p-2  rounded-2xl hover:bg-white hover:text-teal-700 transition-colors duration-300"
                  aria-label="Email"
                >
                  <FaEnvelope size={26} />
                </a>
                <a
                  href="tel:+91 9876543210"
                  className="text-white border-2 p-2  rounded-2xl hover:bg-white hover:text-teal-700 transition-colors duration-300"
                  aria-label="Phone"
                >
                  <FaPhone size={26} />
                </a>
              </div>
            </div>

            <div className="flex-1 bg-gray-100 p-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-teal-800 mb-6">
                Connect with Us
              </h2>
              <form
                action="https://formspree.io/f/xyyavpwr"
                method="post"
                className="space-y-4"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  className="bg-white w-full p-3 border-2 border-teal-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 transition duration-300"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  className="bg-white w-full p-3 border-2 border-teal-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 transition duration-300"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="bg-white w-full p-3 border-2 border-teal-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 transition duration-300"
                  required
                />
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Message"
                  className="bg-white w-full p-3 border-2 border-teal-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 transition duration-300"
                  required
                />
                <div className="flex justify-center">
                  <button className="bg-teal-800 text-white px-6 py-2 font-bold rounded-2xl hover:bg-teal-700 transition duration-300">
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
