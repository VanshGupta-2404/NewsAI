# 📰 NewsAI: News Verification Using AI and ML

**Repository:** [NewsAI](https://github.com/VanshGupta-2404/NewsAI)

## 📌 Overview

**NewsAI** is an AI-powered application designed to verify the authenticity of news articles. By using Large Language Models (LLMs) like **Transformers** and other advanced machine learning techniques, it processes news from multiple sources, checks the consistency and reliability of the content, and provides a confidence score on its truthfulness. This project aims to address the growing concern of fake news and misinformation on the internet.

## 🎯 Objectives

* **News Verification:** Using AI and ML models to analyze news from various sources and determine its authenticity.
* **Multiple Sources Integration:** The system pulls news from different reputable sources to cross-check the consistency of the information.
* **Model Comparison:** Incorporates state-of-the-art models like **BERT**, **GPT**, **T5**, and others to verify news.
* **User-Friendly Interface:** Users can input news URLs or text, and the system provides a verification score based on AI analysis.

## 🛠️ Key Features

* **Real-time News Verification:** The system verifies news articles in real-time by analyzing data from multiple trusted news sources.
* **AI-powered Analysis:** Uses models like **BERT**, **GPT**, **T5**, and other Transformer-based architectures for NLP tasks such as content analysis, summarization, and truthfulness evaluation.
* **Machine Learning Models:** Implements traditional machine learning models for additional filtering and validation of data.
* **Cross-source Validation:** Ensures that the news data is verified across different reputable sources.
* **Confidence Score:** Provides a confidence score that indicates the likelihood of the news being true or false.

## 🧰 Technologies Used

* **Frontend:** HTML, CSS, JavaScript (for user interface and interaction).
* **Backend:** Python (Flask for API, data processing, and AI model integration).
* **NLP Models:**

  * **Transformers** (Hugging Face's `transformers` library for pre-trained models like BERT, GPT, T5).
  * **BERT**, **GPT**, **T5** for news content analysis.
  * **LSTM**, **SVM**, **Random Forest** for additional machine learning-based validation.
* **APIs:** Fetch news articles from multiple trusted news sources.
* **Data Processing:** NLP techniques, such as tokenization, stemming, and named entity recognition (NER), for efficient content validation.

## 📂 Project Structure

```
NewsAI/
├── app.py              # Main Flask application
├── models/             # Machine learning models
│   ├── bert_model.py   # BERT-based news validation
│   ├── gpt_model.py    # GPT-based news validation
│   └── other_models.py # Other models for comparison
├── templates/          # HTML templates for frontend
│   ├── index.html
│   └── result.html
├── static/             # Static files (CSS, JS)
├── utils/              # Utility functions for data processing and validation
│   ├── news_fetch.py   # Fetch news articles from various sources
│   └── preprocess.py   # Preprocessing functions for text
├── requirements.txt    # Dependencies
└── README.md           # Project documentation
```

## 🚀 Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/VanshGupta-2404/NewsAI.git
   cd NewsAI
   ```

2. **Install Dependencies:**

   Ensure you have Python installed, then install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Application:**

   Start the Flask application:

   ```bash
   python app.py
   ```

4. **Access the Web App:**

   Open your browser and go to `http://localhost:5000` to use the NewsAI web application.

## 📊 Insights & Findings

* **State-of-the-art News Verification:** Using AI models like **BERT** and **GPT**, NewsAI achieves a high level of accuracy in distinguishing true news from false claims.
* **Multiple News Sources:** By pulling data from various trusted news sources, the system cross-checks the facts and ensures higher verification reliability.
* **AI Model Comparisons:** Through the integration of several models (BERT, GPT, etc.), the project evaluates the performance and accuracy of each model for news validation tasks.

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request for any bug fixes, features, or improvements.

## 📧 Contact

For any queries or suggestions:

* **Email:** [guptavansh2404@gmail.com](mailto:guptavansh2404@gmail.com)
* **GitHub:** [VanshGupta-2404](https://github.com/VanshGupta-2404)

---
