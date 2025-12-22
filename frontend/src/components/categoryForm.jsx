import PropTypes from "prop-types";

const CategoryForm = ({
  value,
  setValue,
  handleSubmit,
  buttonText = "Submit",
  handleDelete,
  parent,
  setParent,
  mainCategories = [],
}) => {
  const handleDeleteClick = (e) => {
    e.preventDefault(); // Prevent form submission
    if (window.confirm("Are you sure you want to delete this category?")) {
      handleDelete(); // Call the delete function
    }
  };

  return (
    <div className="p-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          className="py-3 px-4 border rounded-lg w-full"
          placeholder="Write category name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {/* Parent category selection */}
        {mainCategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Category (optional)
            </label>
            <select
              className="py-3 px-4 border rounded-lg w-full"
              value={parent || ""}
              onChange={(e) => setParent(e.target.value)}
            >
              <option value="">Select a main category (optional)</option>
              {mainCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to create a main category
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <button className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50">
            {buttonText}
          </button>

          {handleDelete && (
            <button
              onClick={handleDeleteClick} // Use the new handler
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

CategoryForm.propTypes = {
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  handleDelete: PropTypes.func,
  parent: PropTypes.string,
  setParent: PropTypes.func,
  mainCategories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

export default CategoryForm;