from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
# Import SHAP if you want to use it (more complex)
# import shap

app = Flask(__name__)

# Load the model
model = tf.keras.models.load_model('best_ai_code_model.h5')

# Load the vectorizer
with open('tfidf_vectorizer.pkl', 'rb') as file:
    vectorizer = pickle.load(file)

# Function to extract code features (customize this)
def extract_code_features(code):
    # Example: Code length, number of functions, comments, etc.
    features = {
        "code_length": len(code),
        "num_lines": len(code.splitlines()),
        "num_spaces": code.count(" "),
        "num_functions": code.count("def "),
        "num_comments": code.count("#")
    }
    return features

# Function to generate explanations
def generate_explanations(code, features, is_ai, confidence):
    explanations = []
    if is_ai:
        explanations.append("The model predicts this code is AI-generated with high confidence.")
        if features["code_length"] > 200:
            explanations.append("The code snippet is relatively long, a characteristic sometimes seen in AI-generated code.")
        if features["num_comments"] == 0:
            explanations.append("There are no comments in the code, which might indicate AI generation as humans tend to comment their code.")
    else:
        explanations.append("The model predicts this code is human-written.")
        if features["num_functions"] > 0:
            explanations.append("The code includes functions, which are a common characteristic of human-written code for organization and reusability.")
        if features["num_spaces"] > 50:
            explanations.append("The code has proper indentations, which is common in human-written code.")
    return explanations

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    code_snippet = data['code']

    # Vectorize the input code snippet
    code_vectorized = vectorizer.transform([code_snippet]).toarray()

    # Make prediction
    prediction = model.predict(code_vectorized)
    predicted_probability = prediction[0][0]
    predicted_class = 1 if predicted_probability > 0.5 else 0

    # Determine confidence
    confidence = predicted_probability * 100 if predicted_class == 1 else (1 - predicted_probability) * 100

    # Extract code features
    features = extract_code_features(code_snippet)

    # Generate explanations
    is_ai = predicted_class == 1
    explanations = generate_explanations(code_snippet, features, is_ai, confidence)

    # Return the result with confidence and explanations
    result = "AI Generated" if predicted_class == 1 else "Human Written"
    return jsonify({
        'result': result,
        'confidence': confidence,
        'explanations': explanations,
        'features': features  # Send features for chart
    })

if __name__ == '__main__':
    app.run(debug=True)
