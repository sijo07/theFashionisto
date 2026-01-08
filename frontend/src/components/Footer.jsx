import { Link, useLocation } from "react-router-dom";
import { FaTwitter, FaInstagram, FaFacebookF } from "react-icons/fa";

const Footer = () => {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-black border-t border-zinc-900 pt-16 pb-8">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-white">
              THE<span className="text-red-500">FASHIONISTO</span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Redefining luxury style for the modern era. Curated collections that blend timeless elegance with bold contemporary design.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-red-500 hover:text-white transition-all duration-300">
                <FaTwitter size={14} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-red-500 hover:text-white transition-all duration-300">
                <FaInstagram size={14} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-red-500 hover:text-white transition-all duration-300">
                <FaFacebookF size={14} />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Shop</h3>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link to="/shop" className="hover:text-red-500 transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop" className="hover:text-red-500 transition-colors">Best Sellers</Link></li>
              <li><Link to="/shop" className="hover:text-red-500 transition-colors">Accessories</Link></li>
              <li><Link to="/shop" className="hover:text-red-500 transition-colors">Sale</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Support</h3>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link to="/contact" className="hover:text-red-500 transition-colors">Contact Us</Link></li>
              <li><Link to="/profile" className="hover:text-red-500 transition-colors">My Account</Link></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Stay in the Loop</h3>
            <p className="text-zinc-500 text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                required
              />
              <button
                type="submit"
                className="w-full bg-red-600 text-white font-bold uppercase tracking-wider py-3 text-sm hover:bg-red-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} TheFashionisto. All Rights Reserved.
          </p>
          <div className="flex space-x-6 text-xs text-zinc-600">
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
