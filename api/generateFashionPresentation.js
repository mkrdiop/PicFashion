const { GoogleGenAI, Modality } = require("@google/genai");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK.
// This requires a FIREBASE_SERVICE_ACCOUNT_KEY environment variable in Vercel.
// The variable should contain the JSON content of your service account key.
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error.message);
  }
}

// Vercel Serverless Function handler
module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // --- Authentication ---
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided.' });
        }
        
        const idToken = authorizationHeader.split('Bearer ')[1];
        await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        console.error("Error verifying Firebase ID token:", error);
        return res.status(403).json({ error: 'Forbidden: Invalid token.' });
    }
    
    // --- Input Validation ---
    const { 
        base64GarmentData, 
        garmentMimeType, 
        brandName, 
        style, 
        aspectRatio 
    } = req.body;

    if (!base64GarmentData || !garmentMimeType || !brandName || !style || !aspectRatio) {
        return res.status(400).json({ error: 'Bad Request: Missing required parameters.' });
    }

    // --- Gemini API Call ---
    try {
        const geminiApiKey = process.env.GEMINI_KEY;
        if (!geminiApiKey) {
            console.error("GEMINI_KEY environment variable not set.");
            throw new Error("API key is not configured on the server.");
        }
        
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        const garmentPart = {
            inlineData: { data: base64GarmentData, mimeType: garmentMimeType },
        };
        
        let sceneDescription;
        switch (style) {
            case 'Style Urbain/Extérieur':
                sceneDescription = `an elegant street style setting in Dakar, with beautiful, natural morning light.`;
                break;
            case 'Boutique de Luxe':
                sceneDescription = `a high-end, luxurious boutique interior with soft, sophisticated lighting and minimalist decor.`;
                break;
            case 'Mannequin':
                sceneDescription = `a high-quality, abstract or headless mannequin in a clean, well-lit studio with a solid light-grey background. The focus is entirely on the garment's fit and texture.`;
                break;
            case 'Studio Minimaliste':
            default:
                sceneDescription = `a minimalist studio setting with a seamless, light grey background and professional, even lighting.`;
                break;
        }

        const promptText = `As an expert fashion photographer, create a single, highly realistic, professional e-commerce fashion photograph.

The subject is the garment from the provided image. If the garment is on a mannequin or is a flat-lay in the original image, place this exact garment onto a photorealistic human model.

**Model:** The model should be a dark-skinned Senegalese woman, exuding confidence and elegance. Her pose should be natural and showcase the garment's fit and drape effectively. The model must be captured in a full-body shot, from head to feet. Her hair and makeup should be stylish yet understated, complementing the garment. For the 'Mannequin' style, use a mannequin instead of a person, also in a full-body view.

**Setting:** The setting is ${sceneDescription}

**Brand Aesthetic:** The overall mood should align with a modern, chic brand like '${brandName}'.

**Image Quality:** The final image must be of the highest quality, with sharp focus, realistic textures, and perfect lighting. It must have a ${aspectRatio === '9:16' ? '9:16 portrait' : '16:9 landscape'} aspect ratio. It should look like a shot from a high-end fashion magazine or a premium online store. Do not include any text, logos, or watermarks. The final output should be just the image.`;

        const textPart = { text: promptText };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [garmentPart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return res.status(200).json({ base64Image: part.inlineData.data });
            }
        }
        
        throw new Error("No image data found in the API response.");

    } catch (error) {
        console.error("Error calling Gemini API:", error.message);
        return res.status(500).json({ error: 'Internal Server Error: The AI service failed.' });
    }
};
