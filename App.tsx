import React, { useState, useCallback, useEffect } from 'react';
import { generateFashionPresentation } from './services/geminiService';
import { UploadIcon, SparklesIcon, LoadingSpinnerIcon, ErrorIcon, ImageIcon, CameraIcon, UserIcon, ClockIcon, SwatchIcon, GoogleIcon, LogoutIcon, DownloadIcon, ArrowRightIcon, ArrowDownIcon } from './components/Icons';
import { auth } from './firebase/config';
import { 
    onAuthStateChanged, 
    User, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from 'firebase/auth';


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


// --- UI COMPONENTS ---

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
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
                            onClick={onStart}
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
                        {/* Before */}
                        <div className="flex flex-col items-center">
                            <h3 className="text-xl font-semibold mb-4 text-gray-700">Avant : Votre Photo</h3>
                            <div className="bg-white p-4 rounded-lg shadow-xl overflow-hidden aspect-[9/16]">
                                <img 
                                    src="https://i.ibb.co/6rP3S1V/dress-before.jpg" 
                                    alt="Robe sur fond neutre avant transformation IA" 
                                    className="rounded-md w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Arrow for Mobile */}
                        <div className="flex md:hidden justify-center items-center">
                            <ArrowDownIcon className="w-8 h-8 text-indigo-600" />
                        </div>

                        {/* After */}
                        <div className="flex flex-col items-center">
                             <h3 className="text-xl font-semibold mb-4 text-indigo-600">Après : Notre Magie IA</h3>
                             <div className="bg-white p-4 rounded-lg shadow-xl overflow-hidden aspect-[9/16]">
                                <img 
                                    src="https://i.ibb.co/3kZmx7T/dress-after-generated.jpg" 
                                    alt="Mannequin portant la robe dans un décor urbain généré par IA" 
                                    className="rounded-md w-full h-full object-cover"
                                />
                             </div>
                        </div>
                        
                        {/* Arrow for Desktop */}
                        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg z-10">
                           <ArrowRightIcon className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                </div>
            </section>

             {/* Features Section */}
            <section className="py-20 bg-white">
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
                         onClick={onStart}
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
};

const AuthPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [isLogin, setIsLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            setError(null);
            await signInWithPopup(auth, provider);
            // onAuthStateChanged will handle the redirect to the app
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
             // onAuthStateChanged will handle the redirect to the app
        } catch (err: any) {
             switch (err.code) {
                case 'auth/user-not-found':
                    setError("Aucun compte n'est associé à cet e-mail.");
                    break;
                case 'auth/wrong-password':
                    setError('Mot de passe incorrect.');
                    break;
                case 'auth/email-already-in-use':
                    setError('Cet e-mail est déjà utilisé par un autre compte.');
                    break;
                 case 'auth/weak-password':
                    setError('Le mot de passe doit comporter au moins 6 caractères.');
                    break;
                default:
                    setError("Une erreur s'est produite. Veuillez réessayer.");
                    break;
            }
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
             <div className="absolute top-4 left-4">
                 <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                        &larr; Retour à l'accueil
                </button>
            </div>
            <div className="w-full max-w-md">
                <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-12">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{isLogin ? "Connexion" : "Créez votre compte"}</h1>
                        <p className="text-gray-600 mt-2">{isLogin ? "Accédez à votre studio de création." : "Rejoignez-nous pour commencer à créer."}</p>
                    </div>
                    
                    <button 
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        Continuer avec Google
                    </button>

                    <div className="my-6 flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm">OU</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">
                           <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Adresse e-mail
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    placeholder="vous@exemple.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    placeholder="********"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                {isLogin ? "Se connecter" : "Créer mon compte"}
                            </button>
                        </div>
                    </form>
                    
                    <p className="mt-6 text-center text-sm text-gray-600">
                        {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                        <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
                           {isLogin ? "Inscrivez-vous" : "Connectez-vous"}
                        </button>
                    </p>

                </div>
            </div>
        </div>
    );
};

const StudioApp: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-6xl mx-auto">
                <header className="text-center mb-8 relative">
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-4">
                        <span className="text-sm text-gray-600 hidden sm:block">Bienvenue, <span className="font-medium">{user.displayName || user.email}</span></span>
                         <button onClick={onLogout} title="Déconnexion" className="text-gray-500 hover:text-indigo-600 transition-colors">
                            <LogoutIcon className="w-6 h-6"/>
                        </button>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 tracking-tight">
                        Studio de Mode IA
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        Transformez les photos de vos vêtements en présentations e-commerce époustouflantes et réalistes.
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
        </div>
    );
};


const App: React.FC = () => {
    const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // onAuthStateChanged returns an unsubscribe function
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                setView('app');
            }
            setAuthLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setView('landing');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    
    if (authLoading) {
        return (
             <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinnerIcon className="w-12 h-12 text-indigo-600" />
            </div>
        );
    }

    const renderView = () => {
        if (currentUser) {
            return <StudioApp user={currentUser} onLogout={handleLogout} />;
        }
        
        switch (view) {
            case 'auth':
                return <AuthPage onBack={() => setView('landing')} />;
            case 'landing':
            default:
                return <LandingPage onStart={() => setView('auth')} />;
        }
    };

    return <>{renderView()}</>;
}

export default App;
