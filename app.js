// ============================================================================
// SECURITY NOTE: API Key Configuration
// ============================================================================
// NEVER commit your API key directly in this file!
// 
// For production deployment:
// 1. Set the GEMINI_API_KEY environment variable in your hosting platform
// 2. Or use a .env file (NOT committed to git) and load it with a build tool
// 
// For local development:
// - The app will prompt you to enter your API key, which is stored in localStorage
// - This is only suitable for development/testing, not production
// 
// To get your API key: https://makersuite.google.com/app/apikey
// ============================================================================

// Gemini Pro Vision API Configuration
// Load API key from environment variable (if available) or localStorage (for development)
let GEMINI_API_KEY = typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY 
    ? process.env.GEMINI_API_KEY 
    : (localStorage.getItem('gemini_api_key') || '');

let selectedModel = 'gemini-2.5-flash-exp'; // Default to Flash model

const MODELS = {
    flash: 'gemini-2.2-flash-exp',
    pro: 'gemini-2.5-pro'
};

function getApiUrl() {
    return `https://generativelanguage.googleapis.com/v1/models/${selectedModel}:generateContent?key=${GEMINI_API_KEY}`;
}

function checkApiKey() {
    if (!GEMINI_API_KEY) {
        const key = prompt('Please enter your Gemini API key:\n\n(It will be stored locally and never uploaded to GitHub)');
        if (key) {
            GEMINI_API_KEY = key;
            localStorage.setItem('gemini_api_key', key);
        } else {
            alert('API key is required to use this app');
        }
    }
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
const modelFlash = document.getElementById('modelFlash');
const modelPro = document.getElementById('modelPro');

// Model Selection
modelFlash.addEventListener('click', () => {
    selectedModel = MODELS.flash;
    modelFlash.classList.add('active');
    modelPro.classList.remove('active');
});

modelPro.addEventListener('click', () => {
    selectedModel = MODELS.pro;
    modelPro.classList.add('active');
    modelFlash.classList.remove('active');
});

// Button Handlers
cameraBtn.addEventListener('click', () => {
    checkApiKey();
    cameraInput.click();
});

galleryBtn.addEventListener('click', () => {
    checkApiKey();
    galleryInput.click();
});

cameraInput.addEventListener('change', handleImageSelect);
galleryInput.addEventListener('change', handleImageSelect);

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        placeholder.style.display = 'none';
        loading.style.display = 'block';
        results.style.display = 'none';
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Resize image to fit canvas while maintaining aspect ratio
                const maxWidth = 800;
                const maxHeight = 600;
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
                
                // Convert to base64
                const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
                analyzeImage(base64Image);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

async function analyzeImage(base64Image) {
    try {
        const response = await fetch(getApiUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: "Analyze this image and identify all objects, people, text, and notable features. Provide a detailed list of everything you can detect."
                        },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Image
                            }
                        }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        loading.style.display = 'none';
        results.style.display = 'block';
        
        if (data.candidates && data.candidates[0]) {
            const text = data.candidates[0].content.parts[0].text;
            displayResults(text);
        } else if (data.error) {
            displayError(data.error.message);
        } else {
            displayError('No results returned from API');
        }
    } catch (error) {
        loading.style.display = 'none';
        displayError(error.message);
    }
}

function displayResults(text) {
    // Split the text into lines and create list items
    const lines = text.split('\n').filter(line => line.trim());
    detectionsList.innerHTML = '';
    
    lines.forEach(line => {
        const li = document.createElement('li');
        li.textContent = line;
        detectionsList.appendChild(li);
    });
}

function displayError(message) {
    results.style.display = 'block';
    detectionsList.innerHTML = `<li style="color: #ff4444;">Error: ${message}</li>`;
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.log('Service Worker registration failed', err));
}
