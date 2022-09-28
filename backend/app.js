const express = require("express");

require("dotenv/config");

const app = express();
const api = process.env.API_URL;

//Middleware
app.use(express.json());

app.get(api + "/", (req, res) => {
  res.send("Hello API !");
});

app.get(`${api}/products`, (req, res) => {
  const product = {
    id: 1,
    name: "Hair dresser",
    image: "some_url",
  };
  res.send(product);
});

app.post(`${api}/products`, (req, res) => {
  const newProduct = req.body;
  console.log(newProduct);
  res.send(newProduct);
});

app.listen(3000, () => {
  console.log(api);
  console.log("Server is running now on http://localhost:3000");
});
