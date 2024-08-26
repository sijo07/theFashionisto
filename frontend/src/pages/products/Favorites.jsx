import { useSelector } from "react-redux";
import { selectFavoriteProduct } from "../../redux/features/favorites/favoriteSlice";
import Product from "./product";

const Favorites = () => {
  const favorites = useSelector(selectFavoriteProduct);

  return (
    <div className="w-full bg-gray-50">
      <h1 className="flex items-center m-4 h-10 text-1xl lg:text-2xl text-[#649899] font-bold uppercase tracking-wider">
        FAVORITE PRODUCTS
      </h1>

      <div className="max-w-screen-xl relative mx-auto text-center md:text-left bg-white">
        <div className="grid lg:grid-cols-4 gap-10">
          {favorites.map((product) => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
