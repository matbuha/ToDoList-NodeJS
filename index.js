// Import necessary modules and libraries.
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

// Initialize the express application.
const app = express();
const port = 3000;

// Set up the PostgreSQL client with configuration options.
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "123456",
  port: 5432,
});

// Connect to the PostgreSQL database.
db.connect();

// Middleware to parse the body of HTTP requests with URL-encoded payloads.
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to serve static files (like CSS, JavaScript, images) from the 'public' directory.
app.use(express.static("public"));

// In-memory array to store items.
let items = [];

// Route handler for HTTP GET requests to the home page.
app.get("/", async (req, res) => {
  try {
    // Fetch all to-do items from the database and order them by their ID.
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows; // Update the local array with items fetched from database.

    // Render the 'index.ejs' template passing the to-do items and title.
    res.render("index.ejs", {
      listTitle: "To Do:",
      listItems: items,
    });
  } catch (err) {
    console.log(err); // Log any errors.
  }
});

// Route handler for HTTP POST requests to add a new to-do item.
app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    // Insert the new item into the database.
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/"); // Redirect back to the home page.
  } catch (err) {
    console.log(err); // Log any errors.
  }
});

// Route handler for HTTP POST requests to edit an existing to-do item.
app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle; // New title from the form input.
  const id = req.body.updatedItemId; // ID of the item to update.

  try {
    // Update the item in the database with the new title.
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// Route handler for HTTP POST requests to delete an existing to-do item.
app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    // Delete the item from the database.
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// Start the server on the specified port and log the status.
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
