const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/students-db")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB error", err.message));

const Student = mongoose.model("Student", new mongoose.Schema({
  name: String,
  course: String
}));

app.get("/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.post("/students", async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
