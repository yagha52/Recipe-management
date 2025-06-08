import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {fetchBookmarks} from "../../service/api";
import RecipeCard from '../RecipeCard/RecipeCard'; 
import './SavedRecipes.css'; 

const SavedRecipes = () => {
    const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const userId = JSON.parse(localStorage.getItem('user')).id;

    useEffect(() => {
        const getBookmarks = async () => {
            try {
                const data = await fetchBookmarks(userId);
                
                if (!Array.isArray(data)) throw new Error("Invalid response format");
    
                setBookmarkedRecipes(data);
            } catch (err) {
                console.error("Error fetching bookmarks:", err);
                setError(err.message);
            }
        };
    
        getBookmarks();
    }, [userId]);

    return (
        <div className="saved-recipes">
            <h2>Your Bookmarked Recipes</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="recipe-card-container">
                {bookmarkedRecipes.length > 0 ? (
                    bookmarkedRecipes.map(recipe => (
                        <RecipeCard
                            key={recipe.recipe_id}
                            recipe={{
                                id: recipe.recipe_id,
                                title: recipe.recipe_title,
                                image: recipe.recipe_image,
                                category: recipe.recipe_category
                            }}
                            handleClick={(id) => navigate(`/recipe/${id}`)}
                        />
                    ))
                ) : (
                    <p>No bookmarks found.</p>
                )}
            </div>
        </div>
    );
};

export default SavedRecipes; 
