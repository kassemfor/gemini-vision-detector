# Gemini Vision Detector - PWA for iPhone

AI-powered object detection Progressive Web App using **Google Gemini 2.0 Flash API**.

## 🔒 **SECURITY: API Key Protection**

**IMPORTANT:** Your API key is never stored in the code or uploaded to GitHub!

- On first use, the app will prompt you to enter your API key
- The key is stored securely in your browser's localStorage
- The key stays only on your device and is never shared
- You can clear it anytime by clearing your browser data

## 🌟 Features

- 📸 **Camera Integration** - Take photos directly from your iPhone
- 🖼️ **Gallery Selection** - Choose existing photos
- 🤖 **Gemini 2.0 Flash** - Fastest AI object detection
- 🎯 **Gemini 1.5 Pro** - Most accurate analysis
- 📱 **PWA Ready** - Install as native iPhone app
- ⚡ **Model Selector** - Switch between speed and accuracy
- 🎨 **Beautiful UI** - Modern, responsive design
- 🔒 **Secure** - API key stored locally, never in code

## 🚀 Live Demo

**Visit**: https://kassemfor.github.io/gemini-vision-detector/

## 📱 Install on iPhone

1. Open Safari on your iPhone
2. Navigate to the live demo URL
3. Tap the **Share** button
4. Select **"Add to Home Screen"**
5. Tap **"Add"**
6. Launch from your home screen!

## 🔑 Getting Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your key
4. Paste it when the app prompts you

## 🛠️ Technologies

- **Google Gemini 2.0 Flash** - Latest AI model
- **Google Gemini 1.5 Pro** - High accuracy model
- **Progressive Web App** - installable, offline-capable
- **Vanilla JavaScript** - No frameworks, pure performance
- **Canvas API** - Image display and manipulation
- **Service Workers** - Offline caching
- **Web Manifest** - Native app experience
- **localStorage** - Secure client-side API key storage

## 📖 How It Works

1. User enters their API key (first time only)
2. User selects or captures an image
3. Image is converted to base64 format
4. Sent to Gemini API for analysis
5. AI analyzes and identifies all objects
6. Results displayed with confidence levels and descriptions

## 🔒 Privacy & Security

- **API key stored locally** - Never uploaded to GitHub or any server
- **No server-side processing** - Direct communication with Google's API
- **Images are processed in real-time** - Not stored permanently
- **Open source** - You can review all the code

## ⚡ Requirements

- Modern web browser (iOS Safari 11.3+)
- Gemini API key (free from Google AI Studio)
- Internet connection for AI detection
- Camera permission (for camera mode)

## 🔧 Troubleshooting

### "API request failed"
- Check if your API key is correct
- Ensure Gemini API is enabled in your Google Cloud project
- Check if you have API quota remaining

### Clear API Key
To enter a new API key:
1. Open browser console (F12)
2. Type: `localStorage.removeItem('gemini_api_key')`
3. Refresh the page

## 📄 License

MIT License - Free to use and modify

---

**Built with ❤️ for iPhone users | Powered by Google Gemini AI**
