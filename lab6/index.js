const express = require("express");
const app = express();

app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static("./views"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

const productRoute = require("./routes/product.route");

app.use("/products", productRoute);
app.get("/", (req, res) => {
    res.redirect("/products");
});

app.listen(3000, () => {
    console.log(`Server is running at http://localhost:3000/`);
});