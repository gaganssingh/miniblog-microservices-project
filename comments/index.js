const { randomBytes } = require("crypto");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(express.json());
app.use(cors());

commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const postId = req.params.id;
  const commentId = randomBytes(4).toString("hex");

  const { content } = req.body;

  const comments = commentsByPostId[postId] || [];

  const newComment = {
    id: commentId,
    content,
    status: "pending",
  };
  comments.push(newComment);

  commentsByPostId[postId] = comments;

  // Emit an event that is captured by the event bus
  await axios.post("http://event-bus-srv:4005/events", {
    type: "CommentCreated",
    data: {
      ...newComment,
      postId,
    },
  });

  res.status(201).send(comments);
});

// Event from the event-bus
app.post("/events", async (req, res) => {
  console.log(`📥 Received event: ${req.body.type}`);

  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];
    const comment = comments.find((c) => c.id === id);
    comment.status = status;

    // Emit event
    await axios.post("http://event-bus-srv:4005/events", {
      type: "CommentUpdated",
      data: {
        id,
        status,
        postId,
        content,
      },
    });
  }

  res.send({});
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`✅ Comments listening on port: ${PORT}`));
