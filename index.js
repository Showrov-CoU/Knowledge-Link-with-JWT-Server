const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0vftcn5.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbConnect = async () => {
  try {
    client.connect();
    console.log("Database Connected Successfully✅");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

const database = client.db("knowledgeDB");
const bookCategories = database.collection("categories");
const bookCollection = database.collection("books");
const reviewers = database.collection("reviewers");

app.post("/categories", async (req, res) => {
  const categories = req.body;
  const result = await bookCategories.insertMany(categories);
  res.send(result);
});
app.post("/books", async (req, res) => {
  const books = req.body;
  const result = await bookCollection.insertMany(books);
  res.send(result);
});
app.post("/reviewers", async (req, res) => {
  const review = req.body;
  const result = await reviewers.insertMany(review);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("App is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
