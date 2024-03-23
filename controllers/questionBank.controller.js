const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const quizCollection = client.db("experiment-labs").collection("questionBank");
