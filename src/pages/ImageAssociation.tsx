import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Image as ImageIcon, Loader2, Download } from 'lucide-react';

export const ImageAssociation: React.FC = () => {
  const [word, setWord] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setError('');
    setImageUrl(null);

    try {
      // Create a fresh instance to ensure it uses the latest selected API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            { text: `A clear, educational, and visually striking illustration representing the English word/concept: "${word}". The image should help a language learner remember the meaning through strong visual association.` }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: size
          }
        }
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setImageUrl(`data:image/png;base64,${base64EncodeString}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("No image was returned by the model.");
      }
    } catch (err: any) {
      console.error('Error generating image:', err);
      if (err.message?.includes('Requested entity was not found')) {
        setError('API Key error. Please select a valid paid Google Cloud API key.');
        // Reset key selection state if needed
        // @ts-ignore
        window.aistudio?.openSelectKey();
      } else {
        setError(err.message || 'Failed to generate image. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <ImageIcon className="text-pink-500" />
          Visual Associations
        </h1>
        <p className="text-zinc-400 text-lg">
          Generate high-quality images to help you remember difficult vocabulary.
        </p>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl mb-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="word" className="block text-sm font-medium text-zinc-300 mb-2">
                Vocabulary Word or Phrase
              </label>
              <input
                id="word"
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g., Serendipity, To procrastinate, Melancholy"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all"
                required
              />
            </div>

            <div className="w-full md:w-48">
              <label htmlFor="size" className="block text-sm font-medium text-zinc-300 mb-2">
                Image Quality
              </label>
              <select
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all appearance-none"
              >
                <option value="1K">1K (Standard)</option>
                <option value="2K">2K (High)</option>
                <option value="4K">4K (Ultra)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !word.trim()}
            className="w-full py-4 px-6 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-600/50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-semibold flex items-center justify-center gap-3 text-lg"
          >
            {loading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Generating Image...
              </>
            ) : (
              <>
                <ImageIcon size={24} />
                Generate Visual Association
              </>
            )}
          </button>
        </form>
      </div>

      {imageUrl && (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative group rounded-2xl overflow-hidden">
            <img src={imageUrl} alt={`Visual association for ${word}`} className="w-full h-auto object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a 
                href={imageUrl} 
                download={`neuroenglish-${word.replace(/\s+/g, '-')}.png`}
                className="px-6 py-3 bg-white text-zinc-900 rounded-xl font-semibold flex items-center gap-2 hover:bg-zinc-200 transition-colors"
              >
                <Download size={20} />
                Download Image
              </a>
            </div>
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-xl font-bold text-white capitalize">{word}</h3>
          </div>
        </div>
      )}
    </div>
  );
};
