const express = require("express");
const app = express();
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));


app.use(express.static("./views"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));
const ticketRoute = require("./routes/ticket.route");
app.use("/tickets", ticketRoute);
app.get("/", (req, res) => {
    res.redirect("/tickets");
});

app.listen(3000, () => {
    console.log(`Server is running at http://localhost:3000/`);
});
