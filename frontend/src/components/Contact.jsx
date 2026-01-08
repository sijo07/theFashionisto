import { FaEnvelope, FaTwitter, FaInstagram, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Contact = () => {
  return (
    <div className="bg-black min-h-screen text-white pt-24 pb-12 px-6">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left Column: Information */}
        <div className="space-y-10">
          <div>
            <span className="text-red-500 font-bold tracking-widest text-sm uppercase mb-2 block">Get in Touch</span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-tight mb-6">
              LET'S CREATE <br /> SOMETHING <span className="text-zinc-500">UNIQUE.</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
              Have a question about an order, a collaboration, or just want to say hello? We're listening.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-zinc-900 p-3 rounded-full text-red-500">
                <FaPhone size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Call Us</h3>
                <p className="text-zinc-400">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-zinc-900 p-3 rounded-full text-red-500">
                <FaEnvelope size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Email Us</h3>
                <p className="text-zinc-400">thefashionisto@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-zinc-900 p-3 rounded-full text-red-500">
                <FaMapMarkerAlt size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Visit Us</h3>
                <p className="text-zinc-400">123 Luxury Lane, Fashion District, NY 10001</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-900">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Follow Our Socials</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:border-red-500 hover:text-red-500 transition-all duration-300">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:border-red-500 hover:text-red-500 transition-all duration-300">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:border-red-500 hover:text-red-500 transition-all duration-300">
                <FaEnvelope size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Minimalist Form */}
        <div className="bg-zinc-950 p-8 md:p-12 rounded-2xl border border-zinc-900 shadow-2xl">
          <h2 className="text-2xl font-bold uppercase tracking-wide mb-8">Send a Message</h2>
          <form action="https://formspree.io/f/xyyavpwr" method="post" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Your Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
              <input
                type="email"
                name="email"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Your Message</label>
              <textarea
                name="message"
                rows="5"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-3 px-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                placeholder="Tell us about..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white font-bold uppercase tracking-widest py-4 rounded-md hover:bg-red-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-red-900/20"
            >
              Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
