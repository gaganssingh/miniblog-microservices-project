const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(cors());

// STORAGE
const posts = {};

// HELPERS
const handleEvent = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;
    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    const { id, postId, content, status } = data;
    const post = posts[postId];
    const comment = post.comments.find((c) => c.id === id);

    comment.status = status;
    comment.content = content; // incase we implement a content update feature in the futute
  }
};

// ROUTES
app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  console.log("📥 Event incoming");
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({});
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, async () => {
  console.log(`✅ Query server listening on port: ${PORT}`);

  const res = await axios
    .get("http://localhost:4005/events")
    .catch((err) => console.log(err));
  for (let event of res.data) {
    console.log(`➡️ Processing event: ${event.type}`);
    handleEvent(event.type, event.data);
  }
});
