
const calculateCountInStock = function (next) {
  this.countInStock = this.stocks.reduce(
    (total, stock) => total + stock.quantity,
    0
  );
  next();
};

export default calculateCountInStock;
