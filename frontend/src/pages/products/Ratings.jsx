import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const Ratings = ({ value, text, size, className }) => {
  const safeValue = Math.min(Math.max(Number(value), 0), 5);

  const fullStars = Math.floor(safeValue);
  const halfStars = safeValue % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStars;

  const getColor = (index) => {
    if (index < 1) return "#ff4545"; 
    if (index < 2) return "#ffa534"; 
    if (index < 3) return "#ffe234";
    if (index < 4) return "#b7dd29"; 
    return "#57e32c"; 
  };

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(fullStars)].map((_, index) => (
        <FaStar
          key={`full-${index}`}
          className="ml-1"
          style={{ color: getColor(fullStars), fontSize: size }}
        />
      ))}
      {halfStars === 1 && (
        <FaStarHalfAlt
          className="ml-1"
          style={{ color: getColor(fullStars + 0.5), fontSize: size }}
        />
      )}
      {[...Array(emptyStars)].map((_, index) => (
        <FaRegStar
          key={`empty-${index}`}
          className="ml-1"
          style={{
            color: getColor(fullStars + halfStars + index),
            fontSize: size,
          }}
        />
      ))}
      {text && (
        <span
          className="ml-2"
          style={{
            color: getColor(fullStars),
            fontSize: size,
            fontWeight: "600",
          }}
        >
          {text}
        </span>
      )}
      <span
        className="ml-2"
        style={{
          color: getColor(fullStars),
          fontSize: size,
          fontWeight: "600",
        }}
      >
        {safeValue.toFixed(1)}
      </span>
    </div>
  );
};

Ratings.defaultProps = {
  size: "20px",
  className: "",
};

export default Ratings;
