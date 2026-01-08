const Message = ({ variant, children }) => {
  const getVariantClass = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div
      className={`p-6 rounded-lg border-l-4 shadow-md ${getVariantClass()}`}
      style={{ borderLeftWidth: "6px" }}
    >
      {children}
    </div>
  );
};

export default Message;
