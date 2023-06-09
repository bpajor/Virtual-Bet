const express = require("express");
const API_KEY = "734fc7bd4866713b585f5a3c0439b156";

const app = express();
const axios = require("axios");

app.get("/",  (req, res, next) => {
  res.send('<h1>Test</h1>')
});

app.listen(3000);
