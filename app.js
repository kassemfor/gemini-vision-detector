// Gemini Pro Vision API Configuration
const GEMINI_API_KEY = 'AIzaSyA6r_qzEsej_J3T52x5ajV8yGSHCaIn5HY';
let selectedModel = 'gemini-1.5-flash'; // Default to Flash model

const MODELS = {
    flash: 'gemini-1.5-flash',
    pro: 'gemini-1.5-pro'
};

function getApiUrl() {
    return `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${GEMINI_API_KEY}`;
}

// DOM Elements
const cameraBtn = document.getElementById('cameraBtn');
const galleryBtn = document.getElementById('galleryBtn');
const cameraInput = document.getElementById('cameraInput');
const galleryInput = document.getElementById('galleryInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const placeholder = document.getElementById('placeholder');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const detectionsList = document.getElementById('detectionsList');
const installPrompt = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');
const dismissBtn = document.getElementById('dismissBtn');
const modelSelector = document.getElementById('modelSelector');

let deferredPrompt;
let currentImage = null;

// Event Listeners
cameraBtn.addEventListener('click', () => cameraInput.click());
galleryBtn.addEventListener('click', () => galleryInput.click());
cameraInput.addEventListener('change', handleImageSelect);
galleryInput.addEventListener('change', handleImageSelect);
dismissBtn.addEventListener('click', () => installPrompt.classList.add('hidden'));
modelSelector.addEventListener('change', (e) => {
    selectedModel = MODELS[e.target.value];
    console.log('Model changed to:', selectedModel);
});

// Install PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installPrompt.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        installPrompt.classList.add('hidden');
    }
});

// Handle Image Selection
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            loadImage(event.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Load Image
function loadImage(src) {
    const img = new Image();
    img.onload = () => {
        currentImage = img;
        displayImage(img);
        detectObjects(src);
    };
    img.src = src;
}

// Display Image on Canvas
function displayImage(img) {
    const maxWidth = canvas.parentElement.clientWidth;
    const maxHeight = 400;
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
    }
    if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    placeholder.classList.add('hidden');
    canvas.style.display = 'block';
}

// Convert Data URL to Base64
function dataURLtoBase64(dataURL) {
    return dataURL.split(',')[1];
}

// Detect Objects using Gemini Pro Vision
async function detectObjects(imageData) {
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    updateStatus('Analyzing...');

    try {
        const base64Image = dataURLtoBase64(imageData);
        
        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: "Analyze this image and list all objects you can detect. For each object, provide: 1) The object name, 2) A confidence level (high/medium/low), 3) A brief description. Format your response as a JSON array with objects having 'class', 'confidence', and 'description' fields."
                    },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Image
                        }
                    }
                ]
            }]
        };

        const response = await fetch(getApiUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const textResponse = data.candidates[0].content.parts[0].text;
            parseAndDisplayResults(textResponse);
        } else {
            throw new Error('No response from Gemini API');
        }

        loading.classList.add('hidden');
        updateStatus('Ready');
    } catch (error) {
        console.error('Detection error:', error);
        loading.classList.add('hidden');
        results.classList.remove('hidden');
        detectionsList.innerHTML = `
            <div class="detection-item error">
                <span class="detection-name">Error</span>
                <span class="detection-confidence">Failed to analyze image</span>
                <div class="detection-desc">${error.message}</div>
            </div>
        `;
        updateStatus('Error');
    }
}

// Parse Gemini Response and Display Results
function parseAndDisplayResults(textResponse) {
    try {
        // Try to extract JSON from the response
        const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
        let detections;
        
        if (jsonMatch) {
            detections = JSON.parse(jsonMatch[0]);
        } else {
            // If no JSON, parse the text response
            detections = parseTextResponse(textResponse);
        }

        displayDetections(detections);
    } catch (error) {
        console.error('Parsing error:', error);
        // Display raw response if parsing fails
        displayRawResponse(textResponse);
    }
}

// Parse Text Response (fallback)
function parseTextResponse(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const detections = [];
    
    for (const line of lines) {
        // Simple parsing - look for patterns
        if (line.includes(':') || line.match(/^\d+\./)) {
            const cleaned = line.replace(/^\d+\./, '').replace(/^-/, '').trim();
            if (cleaned.length > 3) {
                detections.push({
                    class: cleaned.split(':')[0].trim(),
                    confidence: 'medium',
                    description: cleaned.split(':')[1]?.trim() || cleaned
                });
            }
        }
    }
    
    return detections.length > 0 ? detections : [{
        class: 'Analysis',
        confidence: 'high',
        description: text
    }];
}

// Display Raw Response
function displayRawResponse(text) {
    results.classList.remove('hidden');
    detectionsList.innerHTML = `
        <div class="detection-item">
            <span class="detection-name">Gemini Analysis</span>
            <span class="detection-confidence high">Complete</span>
            <div class="detection-desc">${text.replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

// Display Detections
function displayDetections(detections) {
    results.classList.remove('hidden');
    detectionsList.innerHTML = '';

    detections.forEach((detection, index) => {
        const item = document.createElement('div');
        item.className = 'detection-item';
        
        const confidenceClass = typeof detection.confidence === 'string' 
            ? detection.confidence.toLowerCase()
            : detection.confidence > 0.7 ? 'high' : detection.confidence > 0.4 ? 'medium' : 'low';
        
        const confidenceText = typeof detection.confidence === 'string'
            ? detection.confidence
            : `${(detection.confidence * 100).toFixed(0)}%`;
        
        item.innerHTML = `
            <span class="detection-name">${detection.class || 'Object'}</span>
            <span class="detection-confidence ${confidenceClass}">${confidenceText}</span>
            ${detection.description ? `<div class="detection-desc">${detection.description}</div>` : ''}
        `;
        
        detectionsList.appendChild(item);
    });
}

// Update Status
function updateStatus(status) {
    const statusValue = document.querySelector('.stat-value');
    if (statusValue) {
        statusValue.textContent = status;
    }
}

// Initialize
window.addEventListener('load', () => {
    updateStatus('Ready');
    console.log('Gemini Vision Detector initialized');
});
