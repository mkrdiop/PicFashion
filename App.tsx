import React, { useState, useCallback } from 'react';
import { generateFashionPresentation } from './services/geminiService';
import { UploadIcon, SparklesIcon, LoadingSpinnerIcon, ErrorIcon, ImageIcon, CameraIcon, UserIcon, ClockIcon, SwatchIcon, DownloadIcon, ArrowRightIcon, ArrowDownIcon } from './components/Icons';

// --- HELPER FUNCTIONS ---
const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
            resolve({ base64, mimeType });
        };
        reader.onerror = (error) => reject(error);
    });
};

// --- CONSTANTS ---
const PRESENTATION_STYLES = ['Studio Minimaliste', 'Style Urbain/Extérieur', 'Boutique de Luxe', 'Mannequin'];
const ASPECT_RATIOS = ['9:16', '16:9'];


const Studio: React.FC = () => {
    const [garmentImage, setGarmentImage] = useState<{ file: File; preview: string; base64: string; mimeType: string } | null>(null);
    const [brandName, setBrandName] = useState<string>('Adama Paris');
    const [presentationStyle, setPresentationStyle] = useState<string>(PRESENTATION_STYLES[0]);
    const [aspectRatio, setAspectRatio] = useState<string>(ASPECT_RATIOS[0]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const { base64, mimeType } = await fileToBase64(file);
                if (garmentImage) URL.revokeObjectURL(garmentImage.preview);
                setGarmentImage({
                    file,
                    preview: URL.createObjectURL(file),
                    base64,
                    mimeType
                });
                setGeneratedImage(null);
                setError(null);
            } catch (err) {
                console.error("Error converting file to base64:", err);
                setError("Échec du traitement de l'image téléchargée. Veuillez essayer un autre fichier.");
            }
        }
    };

    const handleGenerateClick = useCallback(async () => {
        if (!garmentImage) {
            setError('Veuillez d\'abord télécharger une photo du vêtement.');
            return;
        }
        if (!brandName.trim()) {
            setError('Veuillez saisir un nom de créateur ou de marque.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const resultBase64 = await generateFashionPresentation(
                garmentImage.base64,
                garmentImage.mimeType,
                brandName,
                presentationStyle,
                aspectRatio
            );
            setGeneratedImage(`data:image/png;base64,${resultBase64}`);
        } catch (err) {
            console.error(err);
            setError("Échec de la génération de l'image. Le modèle d'IA est peut-être occupé. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    }, [garmentImage, brandName, presentationStyle, aspectRatio]);

    const handleDownload = () => {
        if (!generatedImage) return;

        const link = document.createElement('a');
        link.href = generatedImage;
        const safeBrandName = brandName.trim().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'creation';
        const styleName = presentationStyle.trim().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        link.download = `studio-ia-${safeBrandName}-${styleName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    return (
        <div className="w-full max-w-6xl mx-auto">
            <header className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 tracking-tight">
                    Le Studio de Création
                </h1>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                    C'est ici que la magie opère. Suivez les étapes pour créer votre présentation.
                </p>
            </header>

            <main className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Input Section */}
                    <div className="flex flex-col space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-4">1. Votre Vêtement</h2>
                            <label htmlFor="image-upload" className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 hover:bg-gray-50 transition-colors duration-300 h-full">
                                {garmentImage ? (
                                    <img src={garmentImage.preview} alt="Aperçu du vêtement" className="max-h-60 mx-auto object-contain rounded-md" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
                                        <UploadIcon className="w-12 h-12 mb-2" />
                                        <span className="font-medium">Cliquez pour télécharger la photo de votre vêtement</span>
                                        <span className="text-sm mt-1">PNG, JPG, ou WEBP (les packshots fonctionnent le mieux)</span>
                                    </div>
                                )}
                                <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                             </label>
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-4">2. Nom du Créateur / de la Marque</h2>
                            <label htmlFor="brand-name" className="block text-sm font-medium text-gray-700 sr-only">Nom de la marque</label>
                            <input
                                id="brand-name"
                                type="text"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                placeholder="ex: Adama Paris"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-4">3. Style de Présentation</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {PRESENTATION_STYLES.map(style => (
                                    <button 
                                        key={style}
                                        onClick={() => setPresentationStyle(style)}
                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${presentationStyle === style ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                         
                        <div>
                            <h2 className="flex items-center text-2xl font-semibold text-gray-700 border-b pb-3 mb-4">
                                 <CameraIcon className="w-6 h-6 mr-3 text-gray-500"/>
                                 4. Format de l'Image
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {ASPECT_RATIOS.map(ratio => {
                                    const label = ratio === '9:16' ? 'Portrait (9:16)' : 'Paysage (16:9)';
                                    return (
                                        <button 
                                            key={ratio}
                                            onClick={() => setAspectRatio(ratio)}
                                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${aspectRatio === ratio ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateClick}
                            disabled={isLoading || !garmentImage}
                            className="w-full flex items-center justify-center px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none mt-auto"
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinnerIcon className="w-5 h-5 mr-3" />
                                    Génération en cours...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    Générer la Présentation
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="flex flex-col">
                       <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-6">5. Votre Présentation Générée par l'IA</h2>
                       <div className="flex-grow bg-gray-100 rounded-lg flex items-center justify-center p-4 min-h-[400px] lg:min-h-0 relative overflow-hidden">
                            {isLoading && (
                                <div className="text-center text-gray-600">
                                    <LoadingSpinnerIcon className="w-12 h-12 mx-auto mb-4" />
                                    <p className="font-medium">L'IA crée votre présentation...</p>
                                    <p className="text-sm">Cela peut prendre un moment.</p>
                                </div>
                            )}
                            {error && !isLoading && (
                                 <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
                                    <ErrorIcon className="w-12 h-12 mx-auto mb-2" />
                                    <p className="font-semibold">Une Erreur est Survenue</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}
                            {!isLoading && !error && generatedImage && (
                                <img src={generatedImage} alt="Présentation générée" className="absolute inset-0 w-full h-full object-cover" />
                            )}
                            {!isLoading && !error && !generatedImage && (
                                 <div className="text-center text-gray-500">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-4"/>
                                    <p className="font-medium">Votre présentation de mode apparaîtra ici.</p>
                                 </div>
                            )}
                       </div>
                       {generatedImage && !isLoading && !error && (
                            <button
                                onClick={handleDownload}
                                className="mt-4 w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
                            >
                                <DownloadIcon className="w-5 h-5 mr-3" />
                                Télécharger l'Image
                            </button>
                       )}
                    </div>
                </div>
            </main>
        </div>
    );
};


const App: React.FC = () => {
    
    const handleStartClick = () => {
        const studioElement = document.getElementById('studio');
        if (studioElement) {
            studioElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-white text-gray-800 font-sans">
            {/* Hero Section */}
            <header className="relative bg-gray-50 overflow-hidden">
                <div className="container mx-auto px-6 py-24 sm:py-32 text-center relative z-10">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                        Donnez Vie à Vos Créations.
                        <span className="block text-indigo-600">Sans Photographe.</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                        Transformez une simple photo de vêtement en une présentation e-commerce professionnelle en quelques secondes. La solution IA pour les créateurs de mode sénégalais.
                    </p>
                    <div className="mt-10">
                        <button
                            onClick={handleStartClick}
                            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 ease-in-out"
                        >
                            Commencer la Création
                        </button>
                    </div>
                </div>
            </header>

            {/* How it Works Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Comment ça marche ?</h2>
                    <p className="text-gray-600 mb-12">En trois étapes simples.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center">
                            <div className="bg-indigo-100 text-indigo-600 rounded-full p-6 mb-4 text-3xl font-bold">1</div>
                            <h3 className="text-xl font-semibold mb-2">Téléchargez</h3>
                            <p className="text-gray-600">Importez une photo de votre vêtement (packshot).</p>
                        </div>
                        <div className="flex flex-col items-center">
                             <div className="bg-indigo-100 text-indigo-600 rounded-full p-6 mb-4 text-3xl font-bold">2</div>
                            <h3 className="text-xl font-semibold mb-2">Personnalisez</h3>
                            <p className="text-gray-600">Choisissez votre style de présentation et le format de l'image.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-indigo-100 text-indigo-600 rounded-full p-6 mb-4 text-3xl font-bold">3</div>
                            <h3 className="text-xl font-semibold mb-2">Générez</h3>
                            <p className="text-gray-600">Notre IA crée une scène photoréaliste pour vous.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Transformation Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Voyez la Transformation</h2>
                    <p className="text-gray-600 mb-12 max-w-2xl mx-auto">D'une simple photo de produit à une publicité de mode captivante, générée par IA.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl font-semibold mb-4 text-gray-700">Avant : Votre Photo</h3>
                            <div className="bg-white p-4 rounded-lg shadow-xl overflow-hidden aspect-[9/16]">
                                <img 
                                    src="https://i.ibb.co/yQk3v14/dress-before-mannequin.jpg" 
                                    alt="Robe sur mannequin en bois avant transformation IA" 
                                    className="rounded-md w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="flex md:hidden justify-center items-center">
                            <ArrowDownIcon className="w-8 h-8 text-indigo-600" />
                        </div>

                        <div className="flex flex-col items-center">
                             <h3 className="text-xl font-semibold mb-4 text-indigo-600">Après : Notre Magie IA</h3>
                             <div className="bg-white p-4 rounded-lg shadow-xl overflow-hidden aspect-[9/16]">
                                <img 
                                    src="https://i.ibb.co/hK7Jg8q/dress-after-human.jpg" 
                                    alt="Modèle humain portant la robe dans un décor photoréaliste généré par IA" 
                                    className="rounded-md w-full h-full object-cover"
                                />
                             </div>
                        </div>
                        
                        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg z-10">
                           <ArrowRightIcon className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Studio Section */}
            <section id="studio" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <Studio />
                </div>
            </section>

             {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold">Conçu pour l'Excellence</h2>
                        <p className="text-gray-600">Des outils puissants pour sublimer vos créations.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center border">
                            <SparklesIcon className="w-10 h-10 mx-auto text-indigo-500 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Qualité Professionnelle</h3>
                            <p className="text-sm text-gray-600">Des images dignes d'un magazine de mode pour captiver votre audience.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center border">
                            <ClockIcon className="w-10 h-10 mx-auto text-indigo-500 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Gain de Temps & d'Argent</h3>
                            <p className="text-sm text-gray-600">Plus besoin de séances photo coûteuses et complexes à organiser.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center border">
                            <UserIcon className="w-10 h-10 mx-auto text-indigo-500 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Modèles Réalistes</h3>
                            <p className="text-sm text-gray-600">Présentez vos créations sur des modèles photoréalistes et variés.</p>
                        </div>
                         <div className="bg-white p-6 rounded-lg shadow-sm text-center border">
                            <SwatchIcon className="w-10 h-10 mx-auto text-indigo-500 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Styles Multiples</h3>
                            <p className="text-sm text-gray-600">Du studio minimaliste au style urbain, choisissez l'ambiance parfaite.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
             <section className="bg-indigo-700 text-white">
                <div className="container mx-auto px-6 py-20 text-center">
                    <h2 className="text-3xl font-bold mb-4">Prêt à Révolutionner Vos Présentations ?</h2>
                    <p className="max-w-2xl mx-auto mb-8 opacity-90">
                        Rejoignez les créateurs qui utilisent l'IA pour vendre plus et marquer les esprits.
                    </p>
                    <button
                         onClick={handleStartClick}
                         className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 ease-in-out"
                    >
                        Créer Ma Première Image
                    </button>
                </div>
            </section>

            <footer className="bg-gray-800 text-white py-6">
                <div className="container mx-auto px-6 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Studio de Mode IA. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}

export default App;