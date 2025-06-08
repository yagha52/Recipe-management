import axios from "axios";

const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchRecipes = async () => {
    try {
        const response = await api.get(`http://localhost:5000/recipes`);
        return { recipes: response.data || [] };
    } catch (error) {
        console.error("Fetching recipes failed:", error);
        return { recipes: [], totalRecipes: 0, totalPages: 1, currentPage: 1 };
    }
};

export const fetchCategories = async () => {
    try {
        const response = await api.get(`http://localhost:5000/categories`);
        return response.data || [];
    } catch (error) {
        console.error("Fetching categories failed:", error);
        return [];
    }
};

export const fetchIngredients = async () => {
    try {
        const response = await api.get(`http://localhost:5000/ingredients`);
        return response.data || [];
    } catch (error) {
        console.error("Fetching ingredients failed:", error);
        return [];
    }
};

export const fetchBookmarks = async (userId) => {
    try {
        const response = await api.get(`http://localhost:5000/bookmarks/${userId}`);
        return response.data || [];
    } catch (error) {
        console.error("Fetching bookmarks failed:", error);
        return [];
    }
};

export const addRecipe = async (recipeData) => {
    try {
        const response = await api.post(`http://localhost:5000/recipe`, recipeData);
        return response.data;
    } catch (error) {
        console.error("Adding recipe failed:", error);
        throw error;
    }
};

export const addBookmark = async (userId, recipeId) => {
    try {
        const response = await api.post(`http://localhost:5000/bookmark`, { userId, recipeId });
        return response.data;
    } catch (error) {
        console.error("Adding to bookmarks failed: ", error);
        throw error;
    }
};

export const deleteBookmark = async (userId, recipeId) => {
    try {
        const response = await api.delete(`http://localhost:5000/bookmarks/${userId}/${recipeId}`);
        return response.data;
    } catch (error) {
        console.error("Removing bookmark failed: ", error);
        throw error;
    }
};

export const deleteRecipe = async (recipeId) => {
    try {
        const response = await api.delete(`http://localhost:5000/recipes/${recipeId}`);
        return response.data;
    } catch (error) {
        console.error("Deleting recipe failed:", error);
        throw error;
    }
};
