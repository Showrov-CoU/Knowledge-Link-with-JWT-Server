const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
const borrowedBooks = database.collection("BorrowedBooks");

app.get("/categories", async (req, res) => {
  const cursor = await bookCategories.find();
  const result = await cursor.toArray();
  res.send(result);
});
app.get("/books", async (req, res) => {
  const cursor = await bookCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});
app.get("/reviewers", async (req, res) => {
  const cursor = await reviewers.find();
  const result = await cursor.toArray();
  res.send(result);
});
app.get("/borrowBooks/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  // console.log(email);
  const cursor = borrowedBooks.find(query);
  const result = await cursor.toArray();
  res.send(result);
});
app.get("/category/:name", async (req, res) => {
  const categoryName = req.params.name;
  const query = { category: categoryName };
  const cursor = await bookCollection.find(query);
  const books = await cursor.toArray();
  res.send(books);
});
app.get("/bookdetails/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const book = await bookCollection.findOne(query);
  res.send(book);
});

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
app.post("/addbooks", async (req, res) => {
  const book = req.body;
  //console.log(book);
  const result = await bookCollection.insertOne(book);
  res.send(result);
});
app.post("/reviewers", async (req, res) => {
  const review = req.body;
  const result = await reviewers.insertMany(review);
  res.send(result);
});
app.post("/borrowed", async (req, res) => {
  const returnInfo = req.body;
  const { id, email } = returnInfo;
  // console.log(returnInfo);
  // console.log(email, id);
  const query = { id: id, email: email };
  const borrowExist = await borrowedBooks.findOne(query);
  if (borrowExist) {
    return res.status(200).send("You have already borrowed this book");
  }

  const findBook = { _id: new ObjectId(id) };
  const book = await bookCollection.findOne(findBook);
  if (!book || book.quantity <= 0) {
    return res.status(200).json({
      quantity: true,
      messaage: "Book is not available for borrowing.",
    });
  }
  await bookCollection.updateOne(findBook, { $inc: { quantity: -1 } });

  const result = await borrowedBooks.insertOne(returnInfo);
  res.send(result);
});

app.delete("/borrowBooks/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const returnBook = await borrowedBooks.findOne(query);
  // console.log(returnBook);
  const incQuery = { _id: new ObjectId(returnBook.id) };
  await bookCollection.updateOne(incQuery, { $inc: { quantity: +1 } });

  const result = await borrowedBooks.deleteOne(query);
  res.send(result);
});

app.put("/books/:id", async (req, res) => {
  const id = req.params.id;
  const updateBook = req.body;
  const query = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const book = {
    $set: {
      image: updateBook.image,
      name: updateBook.name,
      author: updateBook.author,
      category: updateBook.category,
      quantity: updateBook.quantity,
      rating: updateBook.rating,
      description: updateBook.description,
    },
  };
  const result = await bookCollection.updateOne(query, book, options);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("App is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
