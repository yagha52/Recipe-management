import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Login from "./components/Login-Signup/Login";
import RecipeDetails from "./components/RecipeDetails/RecipeDetails";
import "./App.css";
import { useEffect } from "react";
import Add from "./components/Add/Add";
import SavedRecipes from './components/SavedRecipes/SavedRecipes';

function App() {
  useEffect(() => {
    const handleClickOutside = (event) => {
      const shareMenus = document.querySelectorAll('.share-menu');
      if (!event.target.closest('.share-container')) {
        shareMenus.forEach(menu => {
          menu.style.display = 'none';
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/add-recipe" element={<Add />} />
        <Route path="/saved-recipes" element={<SavedRecipes />} />
      </Routes>
    </div>
  );
}

export default App;
