import React from "react";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import "./RecipeCard.css";

export default function RecipeCard({ recipe, handleClick }) {
  return (
    <Link to={`/recipe/${recipe.id + 1}`} className="hover-card">
      <Card className="recipe-card" onClick={() => handleClick(recipe.id)}>
        <Card.Img variant="top" src={recipe.image} alt={recipe.title} className="recipe-card-img" />
        <Card.Body>
          <Card.Title className="recipe-card-title">{recipe.title}</Card.Title>
          <Card.Text className="recipe-card-text">{recipe.category}</Card.Text>
        </Card.Body>
      </Card>
    </Link>
  );
}
