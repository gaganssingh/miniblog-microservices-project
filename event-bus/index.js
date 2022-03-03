const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

// DATABASE
const events = [];

app.post("/events", (req, res) => {
  console.log("📥 Event incoming");
  const event = req.body;

  events.push(event);

  // Emit events to all services
  axios
    .post("http://localhost:4000/events", event)
    .catch((err) => console.log(`[❌ POSTS] ${err.message}`));
  axios
    .post("http://localhost:4001/events", event)
    .catch((err) => console.log(`[❌ COMMENTS] ${err.message}`));
  axios
    .post("http://localhost:4002/events", event)
    .catch((err) => console.log(`[❌ QUERY] ${err.message}`));
  axios
    .post("http://localhost:4003/events", event)
    .catch((err) => console.log(`[❌ QUERY] ${err.message}`));

  res.send({ statusL: "Ok 👍🏼" });
});

app.get("/events", (req, res) => {
  res.send(events);
});

const PORT = process.env.PORT || 4005;
app.listen(PORT, () =>
  console.log(`✅ Posts server listening on port: ${PORT}`)
);
