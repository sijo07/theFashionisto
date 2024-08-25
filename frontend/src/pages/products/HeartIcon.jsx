import { useEffect } from "react";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { FaRegHeart, FaHeart } from "react-icons/fa";
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

const HeartIcon = ({ product }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites) || [];
  const isFavorite = favorites.some((p) => p._id === product._id);

  useEffect(() => {
    const favoritesFromLocalStorage = getFavoritesFromLocalStorage();
    dispatch(setFavorites(favoritesFromLocalStorage));
  }, []);

  const toggleFavorites = () => {
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
      className="absolute top-0 right-0 p-1 cursor-pointer bg-white"
      onClick={toggleFavorites}
    >
      {isFavorite ? (
        <FaHeart className="text-[#FF4B55] m-1 text-md" />
      ) : (
        <FaRegHeart className=" m-1 text-md" />
      )}
    </div>
  );
};

export default HeartIcon;
