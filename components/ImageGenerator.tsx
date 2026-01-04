
import React, { useState } from 'react';
import { generateMealImage } from '../services/geminiService';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Safety check for AI Studio key selection (per guidelines)
    if (typeof window !== 'undefined' && (window as any).aistudio) {
       const hasKey = await (window as any).aistudio.hasSelectedApiKey();
       if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
          // Proceed after opening dialog (mitigating race condition as per guidelines)
       }
    }

    setLoading(true);
    try {
      const url = await generateMealImage(prompt, size);
      setGeneratedUrl(url);
    } catch (error: any) {
      // Fix: Handle API key missing or invalid projects by prompting re-selection
      if (error?.message?.includes("Requested entity was not found.") && (window as any).aistudio) {
        await (window as any).aistudio.openSelectKey();
      }
      alert("Error al generar la imagen. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-4xl mx-auto border border-gray-100 dark:border-gray-700">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-display font-bold text-accent-brown dark:text-white mb-2">Visualiza tu Plato Ideal</h3>
        <p className="text-gray-600 dark:text-gray-400">Describe el combo que tienes en mente y nuestra IA lo creará para ti.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">¿Cómo es tu plato ideal?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: Un plato de arroz chaufa con lomo saltado encima, papas fritas crujientes y una crema de rocoto roja a un lado."
              className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl p-4 h-32 text-sm focus:ring-2 focus:ring-primary dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Calidad de Imagen</label>
            <div className="flex gap-2">
              {(["1K", "2K", "4K"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                    size === s ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-secondary hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-icons animate-spin">refresh</span>
                Cocinando tu imagen...
              </>
            ) : (
              <>
                <span className="material-icons">auto_awesome</span>
                Generar Imagen de Antojo
              </>
            )}
          </button>
        </div>

        <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden relative">
          {generatedUrl ? (
            <img src={generatedUrl} alt="Generación IA" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-8">
              <span className="material-icons text-6xl text-gray-300 mb-4">image</span>
              <p className="text-gray-400 text-sm">Tu creación aparecerá aquí</p>
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-primary">IA trabajando...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
