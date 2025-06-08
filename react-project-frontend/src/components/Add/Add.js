import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, addRecipe } from '../../service/api';
import './Add.css';

const AddRecipe = ({ user = { id: 1 } }) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);//from API
    const [category, setCategory] = useState([]);//from selected categories
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [notes, setNotes] = useState('');
    const [author, setAuthor] = useState('Alice');
    const [image, setImage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetchCategories();
                setCategories(response);
            } catch (error) {
                console.error('Error:', error);
                setError('Error fetching categories. Please try again.');
            }
        };

        loadCategories();
    }, []);

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (user.id !== 1) {
            setError('You do not have permission to add recipes.');
            return;
        }

        const ingredientsList = [];
        const ingredientsArray = ingredients.split(',');
        for (let i = 0; i < ingredientsArray.length; i++) {
            ingredientsList.push(ingredientsArray[i].trim());
        }

        const recipeData = {
            recipe_title: title,
            recipe_desc: description,
            recipe_ingredients: ingredientsList.join(", "),
            recipe_instructions: instructions,
            recipe_notes: notes,
            recipe_author: author,
            category_name: category,
            image_url: image
        };
        console.log("Data sent: ", JSON.stringify(recipeData, null, 2));

        await submitRecipe(recipeData);
    };

    const submitRecipe = async (recipeData) => {
        try {
            await addRecipe(recipeData);
            alert('Recipe added successfully!');
            navigate('/');
        } catch (error) {
            console.error('Error:', error);
            setError(`Error adding recipe: ${error.message}`);
        }
    };

    return (
        <div className="add-recipe">
            <h2>Add a New Recipe</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">*Title:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="category">*Category:</label>
                    <select
                        id="category"
                        name="category"
                        value={category}
                        onChange={handleCategoryChange}
                        required
                    >
                        {categories.length > 0 && (() => {
                            const options = [];
                            for (let i = 0; i < categories.length; i++) {
                                options.push(
                                    <option key={categories[i].category_id} value={categories[i].category_name}>
                                        {categories[i].category_name}
                                    </option>
                                );
                            }
                            return options;
                        })()}
                    </select>

                </div>
                <div>
                    <label htmlFor="description">*Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="ingredients">*Ingredients (comma-separated):</label>
                    <input
                        type="text"
                        id="ingredients"
                        name="ingredients"
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="instructions">*Instructions:</label>
                    <textarea
                        id="instructions"
                        name="instructions"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows="3"
                        required
                    />
                </div>
                <div>
                    <label htmlFor='image'>*Image:</label>
                    <input id='image'
                        type='text'
                        placeholder='Image URL'
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        required />
                </div>
                <div>
                    <label htmlFor="notes">Notes:</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                    />
                </div>
                <button type="submit">Add Recipe</button>
            </form>
        </div>
    );
};

export default AddRecipe;