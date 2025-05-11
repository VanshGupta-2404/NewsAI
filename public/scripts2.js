// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

// API Keys (REPLACE WITH YOUR ACTUAL KEYS)
const apiKeys = {
    mediastack: "406f7cad698536cd830bf1e876f2949e",
    thenewsapi: "6a62b3f6102645288904a16e865eb59d",
    // gemini: "Replace with your Gemini API Key" // Replace with your Gemini API Key
};

// Backend API URL for MongoDB operations
const BACKEND_URL = "http://localhost:8080/api"; // Change this to your actual backend URL

// Fetch News from Mediastack

async function fetchNewsFromMediastack() {
    const url = `https://api.mediastack.com/v1/news?access_key=${apiKeys.mediastack}&countries=in&languages=en`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Mediastack API Error: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data.data || [];
    } catch (error) {
        console.error("Mediastack Error:", error);
        return [];
    }
}

// Fetch News from TheNewsAPI
async function fetchNewsFromTheNewsAPI() {
    const url = `https://api.thenewsapi.com/v1/news/headlines?locale=in&language=en&api_token=${apiKeys.thenewsapi}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TheNewsAPI Error: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data.data || [];
    } catch (error) {
        console.error("TheNewsAPI Error:", error);
        return [];
    }
}

// Save News to MongoDB
async function saveNewsToMongoDB(article) {
    try {
        const response = await fetch(`${BACKEND_URL}/saved-news`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: article.title,
                description: article.description || "No description available.",
                url: article.url,
                image: article.image || article.urlToImage || 'image.png',
                source: article.source || article.source_id || "Unknown",
                publishedAt: article.published_at || article.published || new Date().toISOString(),
                savedAt: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Save Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        return {
            success: true,
            message: "News saved successfully!",
            data: result
        };
    } catch (error) {
        console.error("Save to MongoDB Error:", error);
        return {
            success: false,
            message: "Failed to save news. Try again later.",
            error: error.message
        };
    }
}

// Fetch Saved News from MongoDB
async function fetchSavedNews() {
    try {
        const response = await fetch(`${BACKEND_URL}/saved-news`);
        if (!response.ok) {
            throw new Error(`Fetch Saved News Error: ${response.status}`);
        }
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error("Fetch Saved News Error:", error);
        return [];
    }
}

// Delete Saved News from MongoDB
async function deleteSavedNews(id) {
    try {
        const response = await fetch(`${BACKEND_URL}/saved-news/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Delete Error: ${response.status}`);
        }
        return { success: true, message: "News deleted successfully!" };
    } catch (error) {
        console.error("Delete Saved News Error:", error);
        return { success: false, message: "Failed to delete news." };
    }
}

// Verify News with Gemini API
async function verifyNews(newsTitle, newsDescription) {
    if (!apiKeys.gemini) {
        console.error("Gemini API key is missing. Verification will not work.");
        return { 
            status: "disabled",
            message: "Verification Disabled (Key Missing)",
            icon: "fa-exclamation-triangle"
        };
    }

    const prompt = `You are a fact-checking AI. Verify if the following news is genuine or fake. Respond strictly with "Yes" if it is genuine and "No" if it is fake.
    News Title: ${newsTitle}
    News Description: ${newsDescription || "No description provided."}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKeys.gemini}`;

    const body = JSON.stringify({
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 5
        }
    });

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No";
        
        if (result.trim().toLowerCase() === "yes") {
            return { 
                status: "verified",
                message: "Verified News",
                icon: "fa-check-circle"
            };
        } else {
            return { 
                status: "fake",
                message: "Potentially Misleading",
                icon: "fa-exclamation-circle"
            };
        }
    } catch (error) {
        console.error("Gemini Verification Error:", error);
        return { 
            status: "error",
            message: "Verification Failed",
            icon: "fa-times-circle"
        };
    }
}

// Add a trending badge to some news items randomly
function isTrending() {
    return Math.random() > 0.7; // 30% chance to be trending
}

// Display notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <p>${message}</p>
    `;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Display News on Page
async function displayNews() {
    const newsContainer = document.getElementById("news");
    newsContainer.innerHTML = `
        <div class="loading-news">
            <div class="news-loader"><div></div><div></div></div>
            <p>Fetching the latest news for you...</p>
        </div>
    `;

    try {
        const [mediastackNews, thenewsapiNews] = await Promise.all([
            fetchNewsFromMediastack(),
            fetchNewsFromTheNewsAPI()
        ]);

        // Combine and deduplicate news by title
        const allNewsMap = new Map();
        [...mediastackNews, ...thenewsapiNews].forEach(article => {
            if (!allNewsMap.has(article.title)) {
                allNewsMap.set(article.title, article);
            }
        });
        
        const allNews = Array.from(allNewsMap.values());

        if (allNews.length === 0) {
            newsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-newspaper" style="font-size: 3em; color: #ccc; margin-bottom: 20px;"></i>
                    <p>No news available at the moment. Please try again later.</p>
                </div>
            `;
            return;
        }

        newsContainer.innerHTML = ""; // Clear "Loading..." message

        for (const article of allNews) {
            const newsItem = document.createElement("div");
            newsItem.classList.add("news-item");

            // Handle missing images gracefully
            const imageUrl = article.image || article.urlToImage || 'image.png';

            // Random trending badge
            const trendingBadge = isTrending() ? `<div class="news-badge"><i class="fas fa-fire"></i> Trending</div>` : '';

            newsItem.innerHTML = `
                ${trendingBadge}
                <img src="${imageUrl}" alt="News Image" onerror="this.src='https://via.placeholder.com/800x450?text=News+AI'">
                <div class="news-content">
                    <h3>${article.title}</h3>
                    <p>${article.description || "No description available."}</p>
                    
                    <div class="news-actions">
                        <a href="${article.url}" target="_blank" class="read-more-btn">
                            <i class="fas fa-book-open"></i> Read More
                        </a>
                        <button class="verify-btn">
                            <i class="fas fa-shield-alt"></i> Verify
                        </button>
                        <button class="save-btn">
                            <i class="fas fa-bookmark"></i> Save
                        </button>
                    </div>
                    
                    <div class="verification-container">
                        <div class="verification-result">
                            <i class="fas fa-spinner fa-spin"></i> Checking...
                        </div>
                    </div>
                </div>
            `;

            newsContainer.appendChild(newsItem);

            const verifyBtn = newsItem.querySelector(".verify-btn");
            const saveBtn = newsItem.querySelector(".save-btn");
            const resultElement = newsItem.querySelector(".verification-result");
            const verificationContainer = newsItem.querySelector(".verification-container");

            verifyBtn.addEventListener("click", async () => {
                // Show checking animation
                resultElement.className = "verification-result checking show";
                resultElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying news...';
                
                // Get verification result
                const verificationResult = await verifyNews(article.title, article.description);
                
                // Update UI based on result
                resultElement.className = `verification-result ${verificationResult.status} show`;
                resultElement.innerHTML = `<i class="fas ${verificationResult.icon}"></i> ${verificationResult.message}`;
                
                // If API key is missing, add a note
                if (verificationResult.status === "disabled") {
                    resultElement.innerHTML += `<br><small>Add your Gemini API key to enable verification</small>`;
                }
                
                // Add animation to make the result appear
                setTimeout(() => {
                    verificationContainer.style.height = resultElement.offsetHeight + 'px';
                }, 10);
            });

            saveBtn.addEventListener("click", async () => {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                
                const result = await saveNewsToMongoDB(article);
                
                if (result.success) {
                    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
                    saveBtn.classList.add('saved');
                    showNotification(result.message, 'success');
                } else {
                    saveBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save';
                    saveBtn.disabled = false;
                    showNotification(result.message, 'error');
                }
            });
        }
    } catch (error) {
        console.error("Error displaying news:", error);
        newsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3em; color: #ff4b2b; margin-bottom: 20px;"></i>
                <p>Error loading news. Please check your internet connection and try again.</p>
                <button onclick="displayNews()" style="margin-top: 20px; padding: 10px 20px; background: #1e3c72; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-sync"></i> Retry
                </button>
            </div>
        `;
    }
}

// Display Saved News
// Display Saved News from MongoDB
async function displaySavedNews() {
    const newsContainer = document.getElementById("news");
    
    // Show loading state
    newsContainer.innerHTML = `
        <div class="loading-news">
            <div class="news-loader"><div></div><div></div></div>
            <p>Loading your saved news...</p>
        </div>
    `;
    
    try {
        // Fetch saved news from backend
        const savedNews = await fetchSavedNews();
        
        // Create header with back button
        newsContainer.innerHTML = `
            <div class="category-header">
                <h2><i class="fas fa-bookmark"></i> Your Saved News</h2>
                <button onclick="displayNews()" class="back-btn">
                    <i class="fas fa-arrow-left"></i> Back to Latest News
                </button>
            </div>
            <div class="saved-news-container"></div>
        `;
        
        const savedNewsContainer = document.querySelector(".saved-news-container");
        
        // Check if we have any saved news
        if (!savedNews || savedNews.length === 0) {
            savedNewsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark"></i>
                    <h3>No Saved News</h3>
                    <p>Your saved articles will appear here.</p>
                    <button onclick="displayNews()" class="primary-btn">
                        <i class="fas fa-newspaper"></i> Browse News
                    </button>
                </div>
            `;
            return;
        }
        
        // Display each saved article
        savedNews.forEach(article => {
            const newsItem = document.createElement("div");
            newsItem.classList.add("news-item", "saved-item");
            newsItem.dataset.id = article._id;
            
            // Handle missing images gracefully
            const imageUrl = article.image || 'https://via.placeholder.com/800x450?text=Saved+News';
            
            newsItem.innerHTML = `
                <img src="${imageUrl}" alt="News Image" onerror="this.src='https://via.placeholder.com/800x450?text=Saved+News'">
                <div class="news-content">
                    <h3>${article.title}</h3>
                    <p>${article.description || "No description available."}</p>
                    <div class="news-meta">
                        <span><i class="fas fa-newspaper"></i> ${article.source || "Unknown Source"}</span>
                        <span><i class="fas fa-clock"></i> ${formatDate(article.publishedAt || article.savedAt)}</span>
                        <span><i class="fas fa-bookmark"></i> Saved on ${formatDate(article.savedAt)}</span>
                    </div>
                    <div class="news-actions">
                        <a href="${article.url}" target="_blank" class="read-more-btn">
                            <i class="fas fa-book-open"></i> Read Article
                        </a>
                        <button class="delete-btn" onclick="removeFromSaved('${article._id}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;
            
            savedNewsContainer.appendChild(newsItem);
        });
        
    } catch (error) {
        console.error("Error displaying saved news:", error);
        newsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to Load Saved News</h3>
                <p>There was a problem connecting to the database. ${error.message}</p>
                <button onclick="displaySavedNews()" class="retry-btn">
                    <i class="fas fa-sync"></i> Try Again
                </button>
                <button onclick="displayNews()" class="back-btn">
                    <i class="fas fa-arrow-left"></i> Back to News
                </button>
            </div>
        `;
    }
}

// Function to remove a news item from saved collection
async function removeFromSaved(id) {
    try {
        // Show confirmation dialog
        if (!confirm("Are you sure you want to remove this article from your saved news?")) {
            return;
        }
        
        // Find the news item element
        const newsItem = document.querySelector(`.news-item[data-id="${id}"]`);
        if (newsItem) {
            // Show loading state
            newsItem.classList.add("deleting");
            newsItem.innerHTML = `
                <div class="delete-loader">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Removing...</p>
                </div>
            `;
        }
        
        // Call API to delete
        const result = await deleteSavedNews(id);
        
        if (result.success) {
            // Show success notification
            showNotification("Article removed from saved news", "success");
            
            // Remove with animation
            if (newsItem) {
                newsItem.style.height = newsItem.offsetHeight + "px";
                newsItem.style.opacity = "0";
                newsItem.style.transform = "translateX(100%)";
                
                // Remove from DOM after animation
                setTimeout(() => {
                    newsItem.remove();
                    
                    // Check if we have any saved news items left
                    const remainingItems = document.querySelectorAll(".saved-item");
                    if (remainingItems.length === 0) {
                        // Show empty state
                        document.querySelector(".saved-news-container").innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-bookmark"></i>
                                <h3>No Saved News</h3>
                                <p>Your saved articles will appear here.</p>
                                <button onclick="displayNews()" class="primary-btn">
                                    <i class="fas fa-newspaper"></i> Browse News
                                </button>
                            </div>
                        `;
                    }
                }, 300);
            }
        } else {
            // Show error notification
            showNotification("Failed to remove article. Try again.", "error");
            
            // Refresh the saved news display
            displaySavedNews();
        }
    } catch (error) {
        console.error("Error removing saved news:", error);
        showNotification("Error removing article: " + error.message, "error");
        displaySavedNews();
    }
}

// Load News on Page Load
document.addEventListener("DOMContentLoaded", displayNews);

// Add swipe gesture support for mobile to open/close sidebar
document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

let xDown = null;                                                        

function handleTouchStart(evt) {                                         
    xDown = evt.touches[0].clientX;                                      
};                                     

function handleTouchMove(evt) {
    if (!xDown) {
        return;
    }

    const xUp = evt.touches[0].clientX;
    const xDiff = xDown - xUp;

    // Right to left swipe (close sidebar)
    if (xDiff > 50) {
        document.getElementById("sidebar").classList.remove("active");
    }
    
    // Left to right swipe (open sidebar)
    if (xDiff < -50) {
        document.getElementById("sidebar").classList.add("active");
    }
    
    xDown = null;
}