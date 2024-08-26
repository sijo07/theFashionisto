import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const Ratings = ({ value, text, color }) => {
  const safeValue = Math.min(Math.max(Number(value), 0), 5);

  const fullStars = Math.floor(safeValue);
  const halfStars = safeValue % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;

  console.log({ fullStars, halfStars, emptyStars, safeValue });

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, index) => (
        <FaStar key={`full-${index}`} className={`ml-1 text-${color}`} />
      ))}
      {halfStars === 1 && <FaStarHalfAlt className={`ml-1 text-${color}`} />}
      {[...Array(emptyStars)].map((_, index) => (
        <FaRegStar key={`empty-${index}`} className={`ml-1 text-${color}`} />
      ))}
      {text && <span className={`ml-2 text-${color}`}>{text}</span>}
    </div>
  );
};

Ratings.defaultProps = {
  color: "yellow-500",
};

export default Ratings;
