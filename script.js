async function testCORS() {
    try {
        const response = await fetch('https://caa8-34-106-209-198.ngrok-free.app/test', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Origin': 'https://whitehatgarun.github.io',
                'ngrok-skip-browser-warning': 'true'
            }
        });
        const data = await response.json();
        console.log('CORS test result:', data);
    } catch (error) {
        console.error('CORS test error:', error);
    }
}

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

    predictionSection.style.display = 'none';
    errorDisplay.style.display = 'none';
    explanationList.innerHTML = '';

    buttonText.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';
    predictButton.disabled = true;

    try {
        console.log("Sending request to backend...");
        const response = await fetch('https://caa8-34-106-209-198.ngrok-free.app/predict', {
            method: 'POST',
            mode: 'cors',
            headers: { 
                'Content-Type': 'application/json',
                'Origin': 'https://whitehatgarun.github.io',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ code: codeSnippet })
        });

        console.log("Response received. Status:", response.status);
        console.log("Response headers:", response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
        }

        const data = await response.json();
        console.log("Parsed response data:", data);

        if (data.error) {
            throw new Error(data.error);
        }

        const { result, confidence, explanations, features } = data;

        resultText.innerText = result;
        confidenceValue.innerText = confidence.toFixed(2);

        explanations.forEach(explanation => {
            const li = document.createElement('li');
            li.textContent = explanation;
            explanationList.appendChild(li);
        });

        if (featureChart) {
            featureChart.destroy();
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
        console.error('Detailed error:', error);
        console.error('Error stack:', error.stack);
        errorMessage.innerText = `Error during analysis: ${error.message}. Please check the console for more details.`;
        errorDisplay.style.display = 'block';
    } finally {
        buttonText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        predictButton.disabled = false;
    }
}

let featureChart;

// Call the CORS test function when the page loads
window.onload = testCORS;
