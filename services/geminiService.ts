import { GoogleGenAI, Modality } from '@google/genai';

// REMARQUE IMPORTANTE : Pour que cela fonctionne en production sur Vercel,
// vous DEVEZ configurer une variable d'environnement nommée `API_KEY`
// dans les paramètres de votre projet Vercel. Votre projet doit être configuré
// pour exposer cette variable au client.
// AVERTISSEMENT : Exposer une clé API côté client est un risque de sécurité.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateFashionPresentation(
    base64GarmentData: string,
    garmentMimeType: string,
    brandName: string,
    style: string,
    aspectRatio: string
): Promise<string> {
    
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

    try {
        console.log("Appel direct à l'API Gemini depuis le client...");
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
                console.log("Image générée avec succès.");
                return part.inlineData.data;
            }
        }
        
        throw new Error("Aucune donnée d'image trouvée dans la réponse de l'API.");

    } catch (error) {
        console.error("Erreur lors de l'appel de l'API Gemini:", error);
        if (error.message.includes('API key not valid')) {
             throw new Error("La clé API n'est pas valide ou n'a pas été trouvée. Veuillez vérifier votre configuration Vercel.");
        }
        throw new Error("La requête au service IA a échoué. Le service est peut-être surchargé ou la configuration est incorrecte.");
    }
}