const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch"); // Ensure you have installed 'node-fetch'
const { summarizeTextWithGemini } = require("./script"); // Import summarization function

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const MONGODB_URI = "mongodb+srv://12345:12345@news.apblc.mongodb.net/?retryWrites=true&w=majority&appName=News";

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ Connected to MongoDB Atlas");
}).catch(err => {
    console.error("❌ MongoDB Atlas connection error:", err);
});

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "No description available" },
    summary: { type: String, default: "" },
    url: { type: String, required: true },
    image: { type: String, default: "image.png" },
    source: { type: String, default: "Unknown" },
    publishedAt: { type: Date, default: Date.now },
    savedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
});

const News = mongoose.model("News", newsSchema);

// 📌 Fetch News and Store in MongoDB
async function fetchNewsAndStore() {
    const apiKey = "MByJG1klyc7M1pE4k5LSHM7KocXL4FaL1byBqKlh"; // Replace with your News API key
    const apiUrl = `https://api.thenewsapi.com/v1/news/headlines?locale=in&language=en&api_token=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`TheNewsAPI Error: ${response.status}`);

        const data = await response.json();
        const articles = data.data || [];

        for (const article of articles) {
            const existingNews = await News.findOne({ title: article.title });
            if (existingNews) continue; // Skip if already saved

            const summary = await summarizeTextWithGemini(article.description || "No description available.");

            const newNews = new News({
                title: article.title,
                description: article.description,
                summary: summary,
                url: article.url,
                image: article.image_url || "image.png",
                source: article.source || "Unknown",
                publishedAt: article.published_at || new Date().toISOString(),
            });

            await newNews.save();
            console.log(`✅ Stored: ${article.title}`);
        }

    } catch (error) {
        console.error("❌ Error fetching or saving news:", error);
    }
}

// 🔄 Fetch news every 2 hours
setInterval(fetchNewsAndStore, 2 * 60 * 60 * 1000);
fetchNewsAndStore();

// 🏠 Render Home Page
app.get("/", (req, res) => {
    res.render("index");
});

// 📌 Get all saved news
app.get("/api/saved-news", async (req, res) => {
    try {
        const savedNews = await News.find().sort({ savedAt: -1 });
        res.json(savedNews);
    } catch (error) {
        console.error("❌ Error fetching saved news:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Save a news article manually
app.post("/api/saved-news", async (req, res) => {
    try {
        const existingNews = await News.findOne({ title: req.body.title });
        if (existingNews) {
            return res.status(200).json({ message: "News already saved", news: existingNews, alreadySaved: true });
        }

        const summary = await summarizeTextWithGemini(req.body.description || "No description available.");

        const newNews = new News({
            ...req.body,
            summary: summary,
        });

        const savedNews = await newNews.save();
        res.status(201).json(savedNews);
    } catch (error) {
        console.error("❌ Error saving news:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 📌 Delete a news article
app.delete("/api/saved-news/:id", async (req, res) => {
    try {
        const deletedNews = await News.findByIdAndDelete(req.params.id);
        if (!deletedNews) {
            return res.status(404).json({ message: "News not found" });
        }
        res.json({ message: "News deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting news:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
