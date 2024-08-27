import { useState } from "react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const StarRating = ({ onChange }) => {
  const [hoveredStar, setHoveredStar] = useState(null);
  const [rating, setRating] = useState(0);

  const handleMouseEnter = (index) => setHoveredStar(index + 1);
  const handleMouseLeave = () => setHoveredStar(null);
  const handleClick = (index) => {
    const newRating = index + 1;
    setRating(newRating);
    if (onChange) onChange(newRating);
  };

  const getColorForRating = (index) => {
    if (index < 1) return "#ff4545"; 
    if (index < 2) return "#ffa534";
    if (index < 3) return "#ffe234"; 
    if (index < 4) return "#b7dd29"; 
    return "#57e32c"; 
  };

  const defaultColor = "#d1d5db"; 

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const StarIcon =
          index < rating
            ? FaStar
            : index === Math.floor(rating) && rating % 1 >= 0.5
            ? FaStarHalfAlt
            : FaRegStar;

        const starColor =
          hoveredStar !== null
            ? index < hoveredStar
              ? getColorForRating(index + 1)
              : defaultColor
            : index < rating
            ? getColorForRating(index + 1)
            : defaultColor;

        return (
          <div
            key={index}
            style={{ color: starColor }}
            className="cursor-pointer ml-1"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
          >
            <StarIcon size={20} aria-label={`${index + 1} star`} />
          </div>
        );
      })}
      <span
        className="ml-2 text-lg font-semibold"
        style={{ color: getColorForRating(rating) }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default StarRating;
