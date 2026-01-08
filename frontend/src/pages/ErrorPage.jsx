import { useRouteError, Link } from "react-router-dom";
import { FaTerminal, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

const ErrorPage = () => {
    const error = useRouteError();
    console.error(error);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-50 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-2xl text-center"
            >
                <div className="mb-8 inline-block">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600 bg-red-600/10 px-4 py-2 border border-red-600/30">
                        System Exception
                    </span>
                </div>

                <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                    Oops<span className="text-red-600">.</span> <br />
                    Something <span className="italic">Broke</span>
                </h1>

                <p className="text-zinc-500 font-medium text-sm md:text-base mb-12 max-w-md mx-auto leading-relaxed">
                    An unexpected error occurred during the session. Our digital team has been notified of the disruption.
                </p>

                <div className="bg-zinc-950 border border-zinc-900 p-8 mb-12 text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FaTerminal size={80} />
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Crash Report</span>
                    </div>

                    <p className="text-xs md:text-sm font-mono text-red-500/80 mb-4 selection:bg-red-500 selection:text-white">
                        {error?.statusText || error?.message || "Unknown Error"}
                    </p>

                    {error?.stack && (
                        <div className="mt-4 pt-4 border-t border-zinc-900">
                            <pre className="text-[10px] text-zinc-700 whitespace-pre-wrap font-mono leading-relaxed">
                                {error.stack.split('\n').slice(0, 3).join('\n')}...
                            </pre>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-3 bg-red-600 text-white px-10 py-5 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    >
                        <FaArrowLeft /> Return to Home
                    </Link>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-3 bg-transparent border border-zinc-800 text-zinc-400 px-10 py-5 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white hover:border-zinc-400 transition-all"
                    >
                        Re-initialize
                    </button>
                </div>
            </motion.div>

            {/* Aesthetic Footer Decor */}
            <div className="absolute bottom-10 left-10 flex flex-col gap-1 opacity-20 hidden md:flex">
                <div className="h-px w-20 bg-zinc-800" />
                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-500">The Fashionisto Digital Integrity</span>
            </div>
        </div>
    );
};

export default ErrorPage;
