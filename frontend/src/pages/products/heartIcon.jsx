import { useEffect } from "react";
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
  }, [dispatch]);

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
      className="flex items-center justify-center m-6 border border-gray-300 cursor-pointer w-[5rem] h-[2rem]"
      onClick={toggleFavorites}
    >
      {isFavorite ? (
        <>
          <FaHeart className="text-[#FF4B55]" />
          <span className="text-sm ml-1">Liked</span>
        </>
      ) : (
        <>
          <FaRegHeart className="text-gray-500" />
          <span className="text-sm ml-1 text-gray-600">Like</span>
        </>
      )}
    </div>
  );
};

export default HeartIcon;
