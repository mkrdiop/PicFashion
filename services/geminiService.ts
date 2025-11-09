import { auth } from '../firebase/config';

export async function generateFashionPresentation(
    base64GarmentData: string,
    garmentMimeType: string,
    brandName: string,
    style: string,
    aspectRatio: string
): Promise<string> {
    
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Utilisateur non authentifié.");
    }

    try {
        console.log("Appel de la fonction Vercel '/api/generateFashionPresentation'...");
        
        const idToken = await user.getIdToken();

        const response = await fetch('/api/generateFashionPresentation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                base64GarmentData,
                garmentMimeType,
                brandName,
                style,
                aspectRatio
            })
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error("Erreur de la fonction Vercel:", responseData);
            throw new Error(`La requête au service a échoué: ${responseData.error || response.statusText}`);
        }

        if (!responseData || !responseData.base64Image) {
            console.error("La fonction Vercel a retourné une réponse invalide :", responseData);
            throw new Error("La réponse du service IA était vide ou invalide.");
        }
        
        console.log("Image générée reçue avec succès de la fonction Vercel.");
        return responseData.base64Image;

    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction Vercel :", error);
        // L'erreur est déjà assez descriptive, on la relance.
        throw error;
    }
}