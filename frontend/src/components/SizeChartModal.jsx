import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const SizeChartModal = ({ show, onClose, category }) => {
    if (!show) return null;

    // -- Data Definitions --
    // Helper to normalize category strings for matching
    const normalize = (str) => str?.toLowerCase().trim() || "";
    const cat = normalize(category);

    let chartData = { headers: [], rows: [], note: "" };
    let title = "Sizing Guide";

    // -- Logic to Select Chart --
    if (cat.includes("footwear") || cat.includes("shoe") || cat.includes("sneaker") || cat.includes("boot")) {
        title = "Footwear Index";
        chartData = {
            headers: ["US", "UK", "EU", "CM"],
            rows: [
                ["6", "5.5", "38.5", "24"],
                ["7", "6", "40", "25"],
                ["8", "7", "41", "26"],
                ["9", "8", "42.5", "27"],
                ["10", "9", "44", "28"],
                ["11", "10", "45", "29"],
                ["12", "11", "46", "30"],
            ],
            note: "Standard athletic sizing. For boots, consider sizing down 0.5."
        };
    } else if (cat.includes("kid") || cat.includes("child") || cat.includes("boy") || cat.includes("girl")) {
        title = "Junior Sizing";
        chartData = {
            headers: ["Size", "Age (yrs)", "Height (cm)", "Chest (cm)"],
            rows: [
                ["XS", "4-5", "104-110", "56-58"],
                ["S", "6-7", "116-122", "60-63"],
                ["M", "8-9", "128-134", "64-68"],
                ["L", "10-12", "140-152", "72-78"],
                ["XL", "13-14", "158-164", "82-86"],
            ],
            note: "Based on average growth. Size up for looser fit."
        };
    } else if (cat.includes("women") || cat.includes("lady") || cat.includes("dress") || cat.includes("skirt")) {
        title = "Womenswear Index";
        chartData = {
            headers: ["Size", "US", "Bust", "Waist", "Hips"],
            rows: [
                ["XS", "0-2", "31-33", "23-25", "33-35"],
                ["S", "4-6", "33-35", "25-27", "35-37"],
                ["M", "8-10", "35-37", "27-29", "37-39"],
                ["L", "12-14", "37-40", "29-32", "39-42"],
                ["XL", "16-18", "40-43", "32-35", "42-45"],
            ],
            note: "Measurements in inches. Model fits may vary."
        };
    } else if (cat.includes("men") || cat.includes("shirt") || cat.includes("jacket") || cat.includes("trousers") || cat.includes("hoodie")) { // Defaulting 'shirt/jacket' to Men if not specified, or general
        title = "Menswear Index";
        chartData = {
            headers: ["Size", "Chest", "Waist", "Length", "Shoulder"],
            rows: [
                ["XS", "34-36", "28-30", "27", "16.5"],
                ["S", "36-38", "30-32", "27.5", "17"],
                ["M", "38-40", "32-34", "28", "17.75"],
                ["L", "40-42", "34-36", "28.5", "18.5"],
                ["XL", "42-44", "36-38", "29", "19.25"],
                ["XXL", "44-46", "38-40", "29.5", "20"],
            ],
            note: "Measurements in inches. Athletic cut."
        };
    } else {
        // Fallback / Accessories
        title = "Standard Sizing";
        chartData = {
            headers: ["Size", "General Description"],
            rows: [
                ["OS", "One Size Fits Most"],
                ["S/M", "Standard Small/Medium fit"],
                ["L/XL", "Standard Large/Extra Large fit"],
            ],
            note: "Refer to product details for specific dimensions."
        };
    }


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#09090b] border border-zinc-800 w-full max-w-2xl relative overflow-hidden group"
            >
                {/* Header */}
                <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                    <h3 className="text-xl font-playfair font-bold italic text-white">
                        {title.split(' ')[0]} <span className="text-red-600">{title.split(' ')[1] || "Chart"}</span>
                    </h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12">
                    {/* Category Label */}
                    <div className="flex justify-center mb-8">
                        <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 text-zinc-400 uppercase tracking-[0.2em] rounded-sm">
                            {category || "General"} Category
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-center">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    {chartData.headers.map((h, i) => (
                                        <th key={i} className="pb-4 font-bold text-zinc-400 uppercase tracking-widest text-xs">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                                {chartData.rows.map((row, i) => (
                                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-4 font-bold text-white uppercase">{row[0]}</td>
                                        {row.slice(1).map((cell, j) => (
                                            <td key={j} className="py-4 text-zinc-400 group-hover:text-zinc-300">{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 pt-8 border-t border-zinc-900 text-center">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{chartData.note}</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SizeChartModal;
