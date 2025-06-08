import "./Filter.css";

export default function Filter({ categories = [], ingredients = [], onCategoryFilter, onIngredientFilter }) {

  return (
    <div className="filter">
      <select onChange={(e) => onCategoryFilter(e.target.value, "Category")} className="filter-select">
        <option value="">By Category</option>
        {categories?.length > 0 ? (
          categories.map((category) => (
            <option key={category.category_id} value={category.category_name}>
              {category.category_name}
            </option>
          ))
        ) : (
          <option disabled>Loading...</option>
        )}
      </select>

      <select onChange={(e) => onIngredientFilter(e.target.value, "Ingredient")} className="filter-select">
        <option value="">By Ingredient</option>
        {ingredients?.length > 0 ? (
          ingredients.map((ingredient) => (
            <option key={ingredient.ingredient_id} value={ingredient.ingredient_name}>
              {ingredient.ingredient_name}
            </option>
          ))
        ) : (
          <option disabled>Loading...</option>
        )}
      </select>
    </div>
  );
}
