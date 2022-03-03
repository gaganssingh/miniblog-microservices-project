const { randomBytes } = require("crypto");
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

app.post("/events", async (req, res) => {
  console.log("📥 Event incoming");
  const { type, data } = req.body;

  if (type === "CommentCreated") {
    const status = data.content.includes("orange") ? "rejected" : "approved";

    await axios.post("http://localhost:4005/events", {
      type: "CommentModerated",
      data: {
        ...data,
        status,
      },
    });
  }

  res.send({});
});

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => console.log(`✅ Moderation listening on port: ${PORT}`));
