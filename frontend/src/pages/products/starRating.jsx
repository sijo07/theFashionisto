import { useState } from "react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const StarRating = ({ value = 0, onChange, readOnly = false, size = 18 }) => {
  const [hover, setHover] = useState(null);
  const rating = value;

  const handleMouseEnter = (index) => {
    if (!readOnly && onChange) {
      setHover(index + 1);
    }
  };

  const handleMouseLeave = () => {
    setHover(null);
  };

  const handleClick = (index) => {
    if (!readOnly && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;

        let shouldFill = false;
        let shouldHalf = false;

        if (hover !== null) {
          // While hovering, show exact integer stars up to cursor
          shouldFill = ratingValue <= hover;
        } else {
          // Normal display (supports partials if value is decimal)
          shouldFill = ratingValue <= rating;
          shouldHalf = !shouldFill && (ratingValue - 0.5) <= rating;
        }

        let Icon = FaRegStar;
        if (shouldFill) Icon = FaStar;
        else if (shouldHalf) Icon = FaStarHalfAlt;

        return (
          <span
            key={index}
            className={`${readOnly ? "cursor-default" : "cursor-pointer"} transition-transform hover:scale-110`}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            style={{ color: (shouldFill || shouldHalf) ? "#fbbf24" : "#e5e7eb" }}
          >
            <Icon size={size} />
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
