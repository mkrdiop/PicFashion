export async function generateFashionPresentation(
    base64GarmentData: string,
    garmentMimeType: string,
    brandName: string,
    style: string,
    aspectRatio: string
): Promise<string> {
    try {
        const response = await fetch('/api/generateFashionPresentation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                base64GarmentData,
                garmentMimeType,
                brandName,
                style,
                aspectRatio,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `La requête a échoué avec le statut ${response.status}` }));
            throw new Error(errorData.error || `Une erreur inattendue est survenue.`);
        }

        const result = await response.json();
        if (!result.base64Image) {
            throw new Error("Aucune image n'a été retournée par le service.");
        }

        return result.base64Image;

    } catch (error) {
        console.error("Erreur lors de l'appel de la fonction serverless:", error);
        throw new Error("La communication avec le service de génération d'images a échoué. Veuillez réessayer.");
    }
}