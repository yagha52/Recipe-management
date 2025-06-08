import React, { useState, useEffect } from "react";
import Filter from "../Filter/Filter";
import SearchBar from "../SearchBar/SearchBar";
import RecipeCard from "../RecipeCard/RecipeCard";
import { fetchRecipes, fetchCategories, fetchIngredients } from "../../service/api";
import "./Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const userString = localStorage.getItem("user");
    const user = userString && userString !== "undefined" ? JSON.parse(userString) : null;

    useEffect(() => {
        const loadRecipes = async () => {
            try {
                const data = await fetchRecipes();
                if (data) {
                    setRecipes(data.recipes || []);
                    setFilteredRecipes(data.recipes || []);
                }
            } catch (error) {
                console.error("Error fetching recipes:", error);
            }
        };
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                if (data) {
                    setCategories(data.categories || data);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        const loadIngredients = async () => {
            try {
                const data = await fetchIngredients();
                if (data) {
                    setIngredients(data.ingredients || data);
                }
            } catch (error) {
                console.error("Error fetching ingredients:", error);
            }
        };

        loadRecipes();
        loadCategories();
        loadIngredients();
    }, []);

    const handleFilterChange = (filter, filterName) => {
        var ans = [], i;

        switch (filterName) {
            case "Category":
                for (i = 0; i < recipes.length; i++) {
                    if (recipes[i].recipe_category.includes(filter)) {
                        ans.push(recipes[i]);
                    }
                }
                break;
            case "Ingredient":
                for (i = 0; i < recipes.length; i++) {
                    if (recipes[i].recipe_ingredients.includes(filter)) {
                        ans.push(recipes[i]);
                    }
                }
                break;
            default:
                break;
        }

        setFilteredRecipes(ans);
    };

    const handleSearchFilter = () => {
        const ans = recipes.filter((recipe) =>
            recipe.recipe_title.toLowerCase().includes(name.toLowerCase())
        );
        setFilteredRecipes(ans);
    };

    const handleClick = (recipe_id) => {
        navigate(`/recipe/${recipe_id + 1}`);
    };

    return (
        <div className="home-container">
            {user && (
                <div className="welcome-message">
                    <span>Welcome, {user.username}</span>
                </div>
            )}

            <SearchBar
                name={name}
                setName={setName}
                nameFilter={handleSearchFilter}
            />

            <Filter
                categories={categories}
                ingredients={ingredients}
                onCategoryFilter={handleFilterChange}
                onIngredientFilter={handleFilterChange}
            />

            <div className="recipes-flex">
                {filteredRecipes.length === 0 ? (
                    <p>No recipes found.</p>
                ) : (
                    filteredRecipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.recipe_id}
                            recipe={{
                                id: recipe.recipe_id,
                                title: recipe.recipe_title,
                                category: recipe.recipe_category || "",
                                image: recipe.recipe_image || "default-image.jpg",
                            }}
                            handleClick={handleClick}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
