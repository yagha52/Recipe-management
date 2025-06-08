import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchRecipes, fetchBookmarks, deleteRecipe, addBookmark, deleteBookmark } from "../../service/api";
import Share from "../Share/Share";
import Bookmark from "../Bookmark/Bookmark";
import "./RecipeDetails.css";

export default function RecipeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const loadRecipeDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchRecipes();
                if (!data || !data.recipes) {
                    throw new Error('Invalid data received from server');
                }

                const selectedRecipe = data.recipes.find(
                    recipe => recipe.recipe_id === parseInt(id) - 1
                );

                if (!selectedRecipe) throw new Error('Recipe not found');

                setRecipe(selectedRecipe);

                if (userId) {
                    const bookmarks = await fetchBookmarks(userId);
                    const isAlreadyBookmarked = bookmarks.some(bookmark => bookmark.recipe_id + 1 === parseInt(id));
                    setIsBookmarked(isAlreadyBookmarked);
                }

            } catch (error) {
                setError(error.message || "Failed to load recipe details");
                console.error("Error:", error);
                if (error.message === 'Recipe not found') {
                    navigate('/');
                }

            } finally {
                setIsLoading(false);
            }
        };

        const token = localStorage.getItem('token');
        if (token) {
            const user = JSON.parse(localStorage.getItem('user'));
            setUserId(user.id);
        }

        loadRecipeDetails();
    }, [id, userId, navigate]);

    const handleBookmark = async () => {
        if (!userId) {
            alert('You must be logged in to bookmark a recipe. Please log in or sign up.');
            return;
        }
        const previousState = isBookmarked;
        setIsBookmarked(!previousState);
        try {
            if (previousState) {
                await deleteBookmark(userId, id - 1);
            } else {
                await addBookmark(userId, id - 1);
            }
            setIsBookmarked(!isBookmarked);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async () => {
        console.log(`Attempting to delete recipe with ID: ${id - 1}`);
        const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
        if (!confirmDelete) {
            return;
        }

        try {
            const response = await deleteRecipe(id - 1);

            if (response.message === 'Recipe deleted successfully') {
                alert('Recipe deleted successfully!');
                navigate('/');
            } else {
                throw new Error('Failed to delete recipe');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error deleting recipe. Please try again.');
        }
    };

    if (isLoading) {
        return <div className="loading">Loading recipe details...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/')}>Return to Home</button>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return <div className="error">Recipe not found</div>;
    }

    const shareUrl = window.location.href;
    const shareTitle = recipe.recipe_title;
    return (
        <div className="recipe-details">
            <div className="recipe-header">
                <h1>{recipe.recipe_title}</h1>
                <div className="recipe-actions">
                    <Bookmark
                        isBookmarked={isBookmarked}
                        onClick={handleBookmark}
                    />
                    <Share
                        url={shareUrl}
                        title={shareTitle}
                    />
                </div>
            </div>

            {recipe.recipe_image && (
                <img
                    src={recipe.recipe_image}
                    alt={recipe.recipe_title}
                    className="recipe-image"
                />
            )}

            <section className="recipe-description">
                <p>{recipe.recipe_desc}</p>
            </section>

            {recipe.recipe_category && (
                <section className="recipe-category">
                    <h2>Category</h2>
                    <p>{recipe.recipe_category}</p>
                </section>
            )}

            <section className="recipe-ingredients">
                <h2>Ingredients</h2>
                <ul>
                    {recipe.recipe_ingredients?.split(',').map((ingredient, index) => (
                        <li key={index}>{ingredient.trim()}</li>
                    ))}
                </ul>
            </section>

            <section className="recipe-instructions">
                <h2>Instructions</h2>
                <ol>
                    {recipe.recipe_instructions?.split('.').filter(Boolean).map((instruction, index) => (
                        <li key={index}>{instruction.trim()}</li>
                    ))}
                </ol>
            </section>

            {recipe.recipe_notes && (
                <section className="recipe-notes">
                    <h2>Notes</h2>
                    <p>{recipe.recipe_notes}</p>
                </section>
            )}
            {userId === 1 && (
                <button className="delete-button" onClick={handleDelete}>Delete Recipe</button>
            )}
        </div>
    );
}
