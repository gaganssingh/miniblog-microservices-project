const { randomBytes } = require("crypto");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts/create", async (req, res) => {
  const id = randomBytes(4).toString("hex");

  const { title } = req.body;

  posts[id] = { id, title };

  // Send event through to the event bus
  await axios.post("http://event-bus-srv:4005/events", {
    type: "PostCreated",
    data: { id, title },
  });

  res.status(201).send(posts[id]);
});

// Event from the event-bus
app.post("/events", (req, res) => {
  console.log(`📥 Received event: ${req.body.type}`);

  res.send({});
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Posts server listening on port: ${PORT}`);
});
