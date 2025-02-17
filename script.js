async function predictCode() {
    const codeSnippet = document.getElementById('codeSnippet').value;
    const predictionSection = document.getElementById('predictionSection');
    const errorDisplay = document.getElementById('errorDisplay');
    const predictButton = document.getElementById('predictButton');
    const buttonText = document.getElementById('buttonText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultText = document.getElementById('resultText');
    const confidenceValue = document.getElementById('confidenceValue');
    const explanationList = document.getElementById('explanationList');
    const featureChartCanvas = document.getElementById('featureChart');
    const errorMessage = document.getElementById('errorMessage');

    // Reset UI
    predictionSection.style.display = 'none';
    errorDisplay.style.display = 'none';
    explanationList.innerHTML = '';

    // Loading state
    buttonText.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';
    predictButton.disabled = true;

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: codeSnippet })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const { result, confidence, explanations, features } = data;

        // Display Results
        resultText.innerText = result;
        confidenceValue.innerText = confidence.toFixed(2);

        // Display Explanations
        explanations.forEach(explanation => {
            const li = document.createElement('li');
            li.textContent = explanation;
            explanationList.appendChild(li);
        });

        // Create Feature Chart
        if (featureChart) {
            featureChart.destroy(); // Destroy existing chart
        }
        featureChart = new Chart(featureChartCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(features),
                datasets: [{
                    label: 'Feature Importance',
                    data: Object.values(features),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        predictionSection.style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        errorMessage.innerText = 'Error during analysis. Please try again.';
        errorDisplay.style.display = 'block';
    } finally {
        buttonText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        predictButton.disabled = false;
    }
}

let featureChart;  // Global variable to hold the chart instance
