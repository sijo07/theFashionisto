import { useSelector } from "react-redux";

const FavoritesCount = () => {
  const favorites = useSelector((state) => state.favorites);
  const favoritesCount = favorites.length;

  return (
    favoritesCount > 0 && (
      <span className="bg-[#FF4B55] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        {favoritesCount}
      </span>
    )
  );
};

export default FavoritesCount;
