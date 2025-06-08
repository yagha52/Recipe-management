const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL database');
});

//fetch queries
app.get('/recipes', (req, res) => {
  let query = `
    SELECT 
    recipe.*,
    images.image_url AS recipe_image, 
    GROUP_CONCAT(DISTINCT category.category_name ORDER BY category.category_name SEPARATOR ', ') AS recipe_category
    FROM recipe
    LEFT JOIN images ON recipe.recipe_id = images.recipe_id AND images.is_primary = TRUE
    LEFT JOIN recipe_category ON recipe.recipe_id = recipe_category.recipe_id
    LEFT JOIN category ON recipe_category.category_id = category.category_id
    LEFT JOIN user ON recipe.recipe_author = user.user_id
    GROUP BY recipe.recipe_id;
    `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.status(200).json(results);
  });
});

app.get('/recipes/:recipeId', (req, res) => {
  const recipeId = req.params.recipeId;

  let query = `
    SELECT 
      recipe.*,
      images.image_url AS recipe_image, 
      GROUP_CONCAT(DISTINCT category.category_name ORDER BY category.category_name SEPARATOR ', ') AS recipe_category
    FROM recipe
    LEFT JOIN images ON recipe.recipe_id = images.recipe_id AND images.is_primary = TRUE
    LEFT JOIN recipe_category ON recipe.recipe_id = recipe_category.recipe_id
    LEFT JOIN category ON recipe_category.category_id = category.category_id
    LEFT JOIN user ON recipe.recipe_author = user.user_id
    WHERE recipe.recipe_id = ?
    GROUP BY recipe.recipe_id;
  `;

  connection.query(query, [recipeId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.status(200).json(results[0]);
  });
});

app.get('/categories', (req, res) => {
  const query = `SELECT * FROM category`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database query failed' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/ingredients', (req, res) => {
  const query = `SELECT * FROM ingredient`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Database query failed' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/ingredients/:recipeId', (req, res) => {
  const recipeId = req.params.recipeId;

  const query = `
      SELECT 
          ingredient.ingredient_name
      FROM ingredient
      JOIN recipe_ingredient ON ingredient.ingredient_id = recipe_ingredient.ingredient_id
      WHERE recipe_ingredient.recipe_id = ?;
  `;

  connection.query(query, [recipeId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    res.status(200).json(results);
  });
});

app.get('/bookmarks/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
    r.*, 
    i.image_url AS recipe_image, 
    GROUP_CONCAT(DISTINCT c.category_name ORDER BY c.category_name SEPARATOR ', ') AS recipe_category
    FROM recipe r
    JOIN bookmark b ON r.recipe_id = b.recipe_id
    LEFT JOIN images i ON r.recipe_id = i.recipe_id AND i.is_primary = TRUE
    LEFT JOIN recipe_category rc ON r.recipe_id = rc.recipe_id
    LEFT JOIN category c ON rc.category_id = c.category_id
    LEFT JOIN user u ON r.recipe_author = u.user_id
    WHERE b.user_id = ?
    GROUP BY r.recipe_id;
  `;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching bookmarks:', err);
      res.status(500).json({ error: 'Database query failed' });
      return;
    }

    res.status(200).json(results);
  });
});

app.get('/users', (req, res) => {
  const query = 'SELECT user_id, user_name, email FROM user';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users: ', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    res.json(results);
  });
});

//insert queries
app.post('/recipe', (req, res) => {
  console.log('POST /recipe received');
  const query = `
      INSERT INTO recipe (
          recipe_title,
          recipe_desc,
          recipe_ingredients,
          recipe_instructions,
          recipe_notes,
          recipe_author
      ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [
      req.body.recipe_title,
      req.body.recipe_desc,
      req.body.recipe_ingredients,
      req.body.recipe_instructions,
      req.body.recipe_notes,
      req.body.recipe_author
    ],
    (err, result) => {
      if (err) {
        console.error('Error inserting recipe:', err);
        return res.status(500).json({ error: 'Database error' });
      } else {
        const recipeId = result.insertId;
        const selectCategoryId = `SELECT category_id FROM category WHERE category_name = ?`;
        connection.query(selectCategoryId, [req.body.category_name], (err, result) => {
          if (err) {
            console.error('Error fetching category ID:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          if (result.length == 0) {
            return res.status(404).json({ error: 'Category not found' });
          }
          const categoryId = result[0].category_id;
          console.log("Category ID:", categoryId);
          const insertCategoryQuery = `
          INSERT INTO recipe_category(
            recipe_id,
            category_id
            ) VALUES (?, ?)
            `;
          connection.query(
            insertCategoryQuery,
            [
              recipeId,
              categoryId
            ],
            (err) => {
              if (err) {
                console.error('Error inserting category into recipe:', err);
                return res.status(500).json({ error: 'Database error' });
              }
              else {
                const insertImageQuery = `
              INSERT INTO images(
                image_url,
                recipe_id,
                is_primary
                ) VALUES (?, ?, ?)
                `;
                connection.query(
                  insertImageQuery,
                  [
                    req.body.image_url,
                    recipeId,
                    true
                  ],
                  (err) => {
                    if (err) {
                      console.error('Error inserting image into recipe:', err);
                      return res.status(500).json({ error: 'Database error' });
                    } else {
                      return res.status(201).json({ error: 'Recipe Successfully added!' })
                    }
                  }
                )
              }
            });
        })
      }
    });
});

app.post('/category', (req, res) => {
  const query = `INSERT INTO category(category_name) VALUES(?)`;

  connection.query(query, [req.body.category_name], (err, result) => {
    if (err) {
      console.error('Error adding category: ', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.status(201).json({
      message: 'Catgeory added successfully',
      category_id: result.insertId,
    });
  });
})

app.post('/ingredient', (req, res) => {
  const query = `INSERT INTO ingredient(ingredient_name) VALUES(?)`;
  connection.query(query, [req.body.ingredient_name], (err, result) => {
    if (err) {
      console.error('Error adding ingredient: ', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.status(201).json({
      message: 'Ingredient added successfully',
      ingredient_id: result.insertId,
    });
  });
})

app.post('/bookmark', async (req, res) => {
  const { userId, recipeId } = req.body;

  if (!userId || !recipeId) {
      return res.status(400).json({ error: 'User ID and Recipe ID are required.' });
  }

  const query = `INSERT INTO bookmark (user_id, recipe_id) VALUES (?, ?)`;
  try {
      const [result] = await connection.query(query, [userId, recipeId]);
      res.status(201).json({
          message: 'Bookmark added successfully',
          bookmark_id: result.insertId,
      });
  } catch (err) {
      console.error('Error adding bookmark:', err);
      res.status(500).json({ error: 'Database error' });
  }
});

app.post('/share', (req, res) => {
  const { share_method, user_id, recipe_id } = req.body;

  const query = `INSERT INTO share (share_method, user_id, recipe_id) VALUES (?, ?, ?)`;

  connection.query(query, [share_method, user_id, recipe_id], (err, result) => {
    if (err) {
      console.error('Error sharing recipe:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }

    res.status(201).json({
      message: 'Recipe shared successfully',
      share_id: result.insertId,
    });
  });
});

// Authentication Routes
app.post('/auth/signup', (req, res) => {
  const { username, email, password } = req.body;

  const checkQuery = 'SELECT * FROM user WHERE email = ? OR user_name = ?';
  connection.query(checkQuery, [email, username], (err, results) => {
    if (err) {
      console.error('Error checking existing user:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return res.status(400).json({
        error: 'User with this email or username already exists'
      });
    }

    const insertQuery = 'INSERT INTO user (user_name, email, user_password) VALUES (?, ?, ?)';
    connection.query(insertQuery, [username, email, password], (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: result.insertId,
          username,
          email
        }
      });
    });
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM user WHERE email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error finding user:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    if (password !== user.user_password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        username: user.user_name,
        email: user.email
      }
    });
  });
});

//update queries
app.put('/recipes/:recipeId', (req, res) => {
  const recipeId = req.params.recipeId;
  const { recipeTitle, description, ingredients, instructions, notes, category } = req.body;

  if (!recipeTitle || !description || !ingredients || !instructions || !category) {
    return res.status(400).json({ error: 'All fields (title, description, ingredients, instructions, category) are required' });
  }

  const updateRecipeQuery = `
      UPDATE recipe
      SET recipe_title = ?, recipe_desc = ?, recipe_ingredients = ?, recipe_instructions = ?, recipe_notes = ?
      WHERE recipe_id = ?
  `;

  const values = [recipeTitle, description, ingredients, instructions, notes, recipeId];

  connection.query(updateRecipeQuery, values, (err, results) => {
    if (err) {
      console.error('Error updating recipe:', err);
      return res.status(500).json({ error: 'Failed to update recipe' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const categoryArray = category.split(',').map(cat => cat.trim());

    const getCategoryIdsQuery = `SELECT category_id FROM category WHERE category_name IN (?)`;

    connection.query(getCategoryIdsQuery, [categoryArray], (err, categoryResults) => {
      if (err) {
        console.error('Error fetching category IDs:', err);
        return res.status(500).json({ error: 'Failed to fetch categories' });
      }

      if (categoryResults.length === 0) {
        return res.status(400).json({ error: 'Invalid categories provided, categories: ' + categoryArray });
      }

      const categoryIds = categoryResults.map(row => row.category_id);

      const deleteRecipeCategoriesQuery = `DELETE FROM recipe_category WHERE recipe_id = ?`;

      connection.query(deleteRecipeCategoriesQuery, [recipeId], (err) => {
        if (err) {
          console.error('Error deleting old categories:', err);
          return res.status(500).json({ error: 'Failed to update categories' });
        }

        const insertRecipeCategoryQuery = `INSERT INTO recipe_category (recipe_id, category_id) VALUES ?`;
        const recipeCategoryValues = categoryIds.map(catId => [recipeId, catId]);

        connection.query(insertRecipeCategoryQuery, [recipeCategoryValues], (err) => {
          if (err) {
            console.error('Error inserting new categories:', err);
            return res.status(500).json({ error: 'Failed to update categories' });
          }

          res.status(200).json({ message: 'Recipe updated successfully with new categories!' });
        });
      });
    });
  });
});

//delete queries
app.delete('/recipes/:recipeId', (req, res) => {
  const query = `
      DELETE FROM recipe
      WHERE recipe_id = ?;
`;

  connection.query(
    query,
    [req.params.recipeId],
    (err, result) => {
      if (err) {
        console.error('Error deleting recipe:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
      }

      res.status(200).json({
        message: 'Recipe deleted successfully',
        recipe_id: req.params.recipeId
      });
    }
  );
});

app.delete('/category', (req, res) => {
  const query = `
      DELETE FROM category
      WHERE category_name = ?;
`;

  connection.query(
    query,
    [req.body.category_name],
    (err, result) => {
      if (err) {
        console.error('Error deleting Category:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.status(200).json({
        message: 'Category deleted successfully',
        category_name: req.body.category_name
      });
    }
  );
});

app.delete('/ingredient', (req, res) => {
  const query = `DELETE FROM ingredient WHERE ingredient_id = ?`;

  connection.query(query, [req.body.ingredient_id], (err, result) => {
    if (err) {
      console.error('Error deleting ingredient:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Ingredient not found' });
      return;
    }

    res.status(200).json({
      message: 'Ingredient deleted successfully',
      ingredient_id: req.body.ingredient_id,
    });
  });
});

app.delete('/bookmarks/:userId/:recipeId', (req, res) => {
  const { userId, recipeId } = req.params;
  connection.query(
    'DELETE FROM bookmark WHERE user_id = ? AND recipe_id = ?',
    [userId, recipeId],
    (err) => {
      if (err) {
        console.error('Error deleting bookmark:', err);
        return res.status(500).json({ error: 'Failed to delete bookmark' });
      }
      res.status(200).json({ message: 'Bookmark removed' });
    }
  );
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
