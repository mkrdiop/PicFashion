import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

export async function generateFashionPresentation(
    base64GarmentData: string,
    garmentMimeType: string,
    brandName: string,
    style: string,
    aspectRatio: string
): Promise<string> {
    
    try {
        console.log("Appel de la fonction Firebase Cloud 'generateFashionPresentation'...");
        // 'generateFashionPresentation' est le nom de la fonction exportée dans functions/index.js
        const generate = httpsCallable(functions, 'generateFashionPresentation');
        
        const result = await generate({
            base64GarmentData,
            garmentMimeType,
            brandName,
            style,
            aspectRatio
        });

        // La fonction cloud retourne un objet { base64Image: '...' }
        const data = result.data as { base64Image: string };

        if (!data || !data.base64Image) {
            console.error("La fonction Cloud a retourné une réponse invalide :", result);
            throw new Error("La réponse du service IA était vide ou invalide.");
        }
        
        console.log("Image générée reçue avec succès de la fonction cloud.");
        return data.base64Image;

    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction Firebase Cloud :", error);
        // L'erreur d'une fonction appelable est un objet HttpsError
        // qui a des propriétés `code` et `message`. L'erreur côté utilisateur dans App.tsx
        // est générique, il est donc important de consigner l'erreur détaillée ici.
        throw new Error("La requête au service IA a échoué via la fonction backend.");
    }
}