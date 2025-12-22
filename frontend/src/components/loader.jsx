const Loader = () => {
  return (
    <div
      className="animate-spin rounded-full border-4 border-t-4 border-gray-300 border-opacity-50"
      style={{
        width: "60px",
        height: "60px",
        borderTopColor: "#3498db", 
        borderWidth: "6px", 
      }}
    ></div>
  );
};

export default Loader;
