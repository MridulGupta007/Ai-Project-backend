const express = require("express");
const mysql = require("mysql2");
const app = express();
const bodyParse = require("body-parser");
const { TextServiceClient } = require("@google-ai/generativelanguage").v1beta2;
const { GoogleAuth } = require("google-auth-library");
const MODEL_NAME = "models/text-bison-001";
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(bodyParse.urlencoded({ extended: true }));

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "mR34SW123@258",
  database: "sample",
});
let id = 1;
app.post("/generate", (req, res) => {
  //   const [keyword1, keyword2, keyword3] = req.body.keywords
  const name = req.body.name;
  const wordLimit = req.body.wordLimit;
  const professionalism = req.body.professionalism;
  const numOfParagraphs = req.body.numberOfParagraph;
  const client = new TextServiceClient({
    authClient: new GoogleAuth().fromAPIKey(process.env.API_KEY),
  });

  const prompt = `Generate a referral for me, ${name}, applying for a Software Developer Role. The word limit is ${wordLimit}. Divide the referral in ${numOfParagraphs} paragraphs.`;

  client
    .generateText({
      model: MODEL_NAME,
      prompt: {
        text: prompt,
      },
    })
    .then((result) => {
      console.log(result[0].candidates[0].output);
      res.send({ prompt: prompt, reply: result[0].candidates[0].output });
      

      const sqlQuery = `insert into referral values ( ? , ?, ?)`;
      db.query(sqlQuery, [id, prompt, result[0].candidates[0].output], (err, result) => {
        if (err) throw err;
        console.log(result);
       id += 1;
      });
    });
});

app.get('/history', (req, res) => {
  const query = "select * from referral;"
  db.query(query, (err, result) => {
    if(err) throw err;
    res.send(result);
  })
})

app.listen(3001, () => {
  console.log("Server Starting");
});
