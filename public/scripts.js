// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

// API Keys (REPLACE WITH YOUR ACTUAL KEYS)
const apiKeys = {
    mediastack: "406f7cad698536cd830bf1e876f2949e",
    thenewsapi: "8ef19d657c564f71b171120ac0c8338b",
    gemini: ""
    // gemini: "Replace with your Gemini API Key" // Replace with your Gemini API Key
};
function setGeminiApiKey(key) {
    if (key && key.trim() !== "") {
        apiKeys.gemini = key.trim();
        showNotification("Gemini API key successfully set", "success");
        return true;
    } else {
        showNotification("Invalid Gemini API key", "error");
        return false;
    }
}
function setGeminiApiKey(key) {
    if (key && key.trim() !== "") {
        apiKeys.gemini = key.trim();
        showNotification("Gemini API key successfully set", "success");
        return true;
    } else {
        showNotification("Invalid Gemini API key", "error");
        return false;
    }
}

// Backend API URL for MongoDB operations
const BACKEND_URL = "http://localhost:8080/api"; 

// Function to fetch and display news from specific category
async function fetchCategoryNews(category) {
    const newsContainer = document.getElementById("news");
    
    // Show loading state
    newsContainer.innerHTML = `
        <div class="loading-news">
            <div class="news-loader"><div></div><div></div></div>
            <p>Fetching ${category} news for you...</p>
        </div>
    `;
    
    // Map categories to API endpoints
    let apiUrl;
    switch (category) {
        case 'business':
            apiUrl = 'https://newsapi.org/v2/top-headlines?category=business&country=us&apiKey=8ef19d657c564f71b171120ac0c8338b';
            break;
        case 'health':
            apiUrl = 'https://newsapi.org/v2/top-headlines?category=health&country=us&apiKey=8ef19d657c564f71b171120ac0c8338b';
            break;
        case 'politics':
            apiUrl = 'https://newsapi.org/v2/top-headlines?category=politics&country=us&apiKey=8ef19d657c564f71b171120ac0c8338b';
            break;
        case 'industry':
            apiUrl = 'https://newsapi.org/v2/top-headlines?category=general&country=us&apiKey=8ef19d657c564f71b171120ac0c8338b';
            break;
        case 'technology':
            apiUrl = 'https://newsapi.org/v2/top-headlines?category=technology&country=us&apiKey=8ef19d657c564f71b171120ac0c8338b';
            break;
        default:
            console.error("Invalid category");
            newsContainer.innerHTML = `<p>Error: Invalid category selected.</p>`;
            return;
    }

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Clear the container
        newsContainer.innerHTML = `
            <div class="category-header">
                <h2><i class="fas fa-${getCategoryIcon(category)}"></i> ${capitalizeFirstLetter(category)} News</h2>
                <button onclick="displayNews()" class="back-btn">
                    <i class="fas fa-arrow-left"></i> Back to Latest News
                </button>
            </div>
            <div class="category-news-container"></div>
        `;
        
        const categoryNewsContainer = document.querySelector(".category-news-container");
        
        // Check if we have articles
        if (!data.articles || data.articles.length === 0) {
            categoryNewsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-newspaper" style="font-size: 3em; color: #ccc; margin-bottom: 20px;"></i>
                    <p>No ${category} news available at the moment. Please try again later.</p>
                </div>
            `;
            return;
        }
        
        // Display each article
        data.articles.forEach(article => {
            const newsItem = document.createElement("div");
            newsItem.classList.add("news-item");
            
            // Handle missing images gracefully
            const imageUrl = article.image || article.thumbnail || 'https://via.placeholder.com/800x450?text=No+Image';
            
            // Random trending badge
            const trendingBadge = isTrending() ? `<div class="news-badge"><i class="fas fa-fire"></i> Trending</div>` : '';
            
            newsItem.innerHTML = `
                ${trendingBadge}
                <img src="${imageUrl}" alt="News Image" onerror="this.src='https://via.placeholder.com/800x450?text=News+AI'">
                <div class="news-content">
                    <h3>${article.title}</h3>
                    <p>${article.description || "No description available."}</p>
                    <div class="news-meta">
                        <span><i class="fas fa-newspaper"></i> ${article.source || "Unknown Source"}</span>
                        <span><i class="fas fa-clock"></i> ${formatDate(article.publishedAt || new Date())}</span>
                    </div>
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
            
            categoryNewsContainer.appendChild(newsItem);
            
            // Add event listeners for buttons (verify, save)
            attachNewsItemEventListeners(newsItem, article);
        });
        
    } catch (error) {
        console.error(`Error fetching ${category} news:`, error);
        newsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3em; color: #ff4b2b; margin-bottom: 20px;"></i>
                <p>Error loading ${category} news. Please check your internet connection and try again.</p>
                <button onclick="fetchCategoryNews('${category}')" style="margin-top: 20px; padding: 10px 20px; background: #1e3c72; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-sync"></i> Retry
                </button>
                <button onclick="displayNews()" style="margin-top: 20px; margin-left: 10px; padding: 10px 20px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-home"></i> Back to Home
                </button>
            </div>
        `;
    }
}

// Helper function to get appropriate icon for each category
function getCategoryIcon(category) {
    switch (category) {
        case 'business': return 'briefcase';
        case 'health': return 'heartbeat';
        case 'politics': return 'landmark';
        case 'industry': return 'industry';
        case 'technology': return 'microchip';
        default: return 'newspaper';
    }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Helper function to attach event listeners to news items
function attachNewsItemEventListeners(newsItem, article) {
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

// Fetch News from Mediastack

async function fetchNewsFromMediastack() {
    const url = `https://api.mediastack.com/v1/news?access_key=${apiKeys.mediastack}&countries=in&languages=en`;
    try {
        const response = await fetch(url);
        // console.log(response);
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
        console.log('TheNewsAPI Response Status:', response.status);
        
        // Log full response for debugging
        const responseBody = await response.text();
        console.log('TheNewsAPI Response Body:', responseBody);
        
        if (!response.ok) {
            throw new Error(`TheNewsAPI Error: ${response.status} - ${responseBody}`);
        }
        
        const data = JSON.parse(responseBody);
        console.log('TheNewsAPI Parsed Data:', data);
        return data.data || [];
    } catch (error) {
        console.error("TheNewsAPI Fetch Error:", error);
        showNotification(`TheNewsAPI Error: ${error.message}`, 'error');
        return [];
    }
}

// Save News to MongoDB
async function saveNewsToMongoDB(article) {
    try {
        // Extract source name as a string, with fallback
        const sourceName = article.source?.name || 
                           article.source?.id || 
                           article.source || 
                           "Unknown Source";

        const response = await fetch(`${BACKEND_URL}/saved-news`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: article.title,
                description: article.description || "No description available.",
                url: article.url,
                image: article.urlToImage || article.image || 'image.png',
                source: sourceName, // Ensure this is a string
                publishedAt: article.publishedAt || article.published_at || new Date().toISOString(),
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
// Verify News with Gemini API
async function verifyNews(newsTitle, newsDescription) {
    // Check if Gemini API key is available
    if (!apiKeys.gemini) {
        console.error("Gemini API key is missing. Verification will not work.");
        return { 
            status: "disabled",
            message: "Verification Disabled (Key Missing)",
            icon: "fa-exclamation-triangle"
        };
    }

    // Comprehensive prompt for thorough verification
    const prompt = `You are an advanced AI fact-checking system. Carefully analyze the following news for authenticity and credibility.

Verification Criteria:
1. Assess the factual accuracy of the news
2. Check for potential misinformation or misleading content
3. Evaluate the source's reliability
4. Determine if the news seems genuine or suspicious

News Title: ${newsTitle}
News Description: ${newsDescription || "No description provided."}

Verification Instructions:
- Respond with ONLY ONE of these exact responses:
  - "VERIFIED": If the news appears to be completely genuine and factual
  - "SUSPICIOUS": If there are significant doubts about the news's authenticity
  - "UNVERIFIABLE": If there's insufficient information to make a definitive assessment

Your response should be strictly ONE of these three words.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKeys.gemini}`;

    const body = JSON.stringify({
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 10,
            "topP": 0.8
        }
    });

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Gemini API Error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        const result = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || "UNVERIFIABLE";
        
        // Map verification results to UI-friendly responses
        switch(result) {
            case "VERIFIED":
                return { 
                    status: "verified",
                    message: "Verified Authentic News",
                    icon: "fa-check-circle",
                    confidence: "high"
                };
            case "SUSPICIOUS":
                return { 
                    status: "fake",
                    message: "Potentially Misleading News",
                    icon: "fa-exclamation-circle",
                    confidence: "low"
                };
            case "UNVERIFIABLE":
            default:
                return { 
                    status: "uncertain",
                    message: "Unable to Verify",
                    icon: "fa-question-circle",
                    confidence: "none"
                };
        }
    } catch (error) {
        console.error("Gemini Verification Error:", error);
        return { 
            status: "error",
            message: "Verification Failed",
            icon: "fa-times-circle",
            confidence: "none"
        };
    }
}

// Enhanced attachNewsItemEventListeners function
function attachNewsItemEventListeners(newsItem, article) {
    const verifyBtn = newsItem.querySelector(".verify-btn");
    const saveBtn = newsItem.querySelector(".save-btn");
    const verificationContainer = document.createElement('div');
    verificationContainer.className = 'verification-container';
    
    verifyBtn.addEventListener("click", async () => {
        // Create verification result area
        const resultElement = document.createElement('div');
        resultElement.className = 'verification-result checking';
        resultElement.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i> 
            Verifying news authenticity...
        `;
        
        // Clear previous verification results
        verificationContainer.innerHTML = '';
        verificationContainer.appendChild(resultElement);
        
        // Insert verification container after news actions
        const newsActions = newsItem.querySelector('.news-actions');
        newsActions.after(verificationContainer);
        
        try {
            // Perform verification
            const verificationResult = await verifyNews(article.title, article.description);
            
            // Update result element
            resultElement.className = `verification-result ${verificationResult.status}`;
            resultElement.innerHTML = `
                <i class="fas ${verificationResult.icon}"></i> 
                ${verificationResult.message}
            `;
        } catch (error) {
            resultElement.className = 'verification-result error';
            resultElement.innerHTML = `
                <i class="fas fa-times-circle"></i> 
                Verification Failed
            `;
            console.error("Verification Error:", error);
        }
    });

    // Existing save button functionality remains the same
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
        // Use NewsAPI directly instead of multiple APIs
        const response = await fetch('https://newsapi.org/v2/top-headlines?country=us&apiKey=8ef19d657c564f71b171120ac0c8338b');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Log the entire response for debugging
        console.log('Full NewsAPI Response:', data);

        // Check if articles exist
        if (!data.articles || data.articles.length === 0) {
            newsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-newspaper" style="font-size: 3em; color: #ccc; margin-bottom: 20px;"></i>
                    <p>No news available at the moment.</p>
                </div>
            `;
            return;
        }

        // Clear "Loading..." message
        newsContainer.innerHTML = ""; 

        // Process and display articles
        data.articles.forEach(article => {
            const newsItem = document.createElement("div");
            newsItem.classList.add("news-item");

            // Handle missing images gracefully
            const imageUrl = article.urlToImage || 'https://via.placeholder.com/800x450?text=News+Image';

            // Random trending badge
            const trendingBadge = Math.random() > 0.7 ? 
                `<div class="news-badge"><i class="fas fa-fire"></i> Trending</div>` : '';

            newsItem.innerHTML = `
                ${trendingBadge}
                <img src="${imageUrl}" alt="News Image" onerror="this.src='https://via.placeholder.com/800x450?text=News+Image'">
                <div class="news-content">
                    <h3>${article.title}</h3>
                    <p>${article.description || "No description available."}</p>
                    <div class="news-meta">
                        <span><i class="fas fa-newspaper"></i> ${article.source.name || "Unknown Source"}</span>
                        <span><i class="fas fa-clock"></i> ${new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
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
                </div>
            `;

            newsContainer.appendChild(newsItem);

            // Attach event listeners for verify and save buttons
            attachNewsItemEventListeners(newsItem, article);
        });

    } catch (error) {
        console.error("Error displaying news:", error);
        newsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3em; color: #ff4b2b; margin-bottom: 20px;"></i>
                <p>Error loading news. Possible reasons:</p>
                <ul>
                    <li>Network connectivity issues</li>
                    <li>API service disruption</li>
                    <li>Invalid API key</li>
                </ul>
                <p>Technical Details: ${error.message}</p>
                <button onclick="displayNews()" style="margin-top: 20px; padding: 10px 20px; background: #1e3c72; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-sync"></i> Retry
                </button>
            </div>
        `;
    }
}

// Reusable function to attach event listeners to news items
function attachNewsItemEventListeners(newsItem, article) {
    const verifyBtn = newsItem.querySelector(".verify-btn");
    const saveBtn = newsItem.querySelector(".save-btn");

    verifyBtn.addEventListener("click", async () => {
        // Placeholder verification (you can replace with actual verification logic)
        showNotification("Verification not available", "error");
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

    // Right to left swipe (closse sidebar)
    if (xDiff > 50) {
        document.getElementById("sidebar").classList.remove("active");
    }
    
    // Left to right swipe (open sidebar)
    if (xDiff < -50) {
        document.getElementById("sidebar").classList.add("active");
    }
    
    xDown = null;
}