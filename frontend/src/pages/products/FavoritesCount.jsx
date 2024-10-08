import { useSelector } from "react-redux";

const FavoritesCount = () => {
  const favorites = useSelector((state) => state.favorites);
  const favoriteCount = favorites.length;

  return (
    <div className="fixed">
      {favoriteCount > 0 && (
        <span className="px-1 py-0 text-xs ml-2 text-white bg-[#FF4B55] rounded-xl">
          {favoriteCount}
        </span>
      )}
    </div>
  );
};

export default FavoritesCount;
