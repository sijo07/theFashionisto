import { useEffect } from "react";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import {
  addToFavorites,
  removeFromFavorites,
  setFavorites,
} from "../../redux/features/favorites/favoriteSlice";
import {
  addFavoriteToLocalStorage,
  getFavoritesFromLocalStorage,
  removeFavoriteFromLocalStorage,
} from "../../utils/localStorage";

const HeartIcon = ({ product, size = 26, className = "" }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites) || [];
  const isFavorite = favorites.some((p) => p._id === product._id);

  useEffect(() => {
    const favoritesFromLocalStorage = getFavoritesFromLocalStorage();
    dispatch(setFavorites(favoritesFromLocalStorage));
  }, [dispatch]);

  const toggleFavorites = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) {
      dispatch(removeFromFavorites(product));
      removeFavoriteFromLocalStorage(product._id);
    } else {
      dispatch(addToFavorites(product));
      addFavoriteToLocalStorage(product);
    }
  };

  return (
    <div
      className={`cursor-pointer transition-transform duration-200 active:scale-125 ${className}`}
      onClick={toggleFavorites}
    >
      {isFavorite ? (
        <IoHeart size={size} className="text-[#FF4B55]" />
      ) : (
        <IoHeartOutline size={size} className="text-white hover:text-[#FF4B55]" />
      )}
    </div>
  );
};

export default HeartIcon;
