import React, { useState } from 'react';
import { Glasses } from 'lucide-react';

export interface ProductGalleryProps {
  images: string[];
  productName: string;
  modelCode: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  modelCode,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [erroredIndices, setErroredIndices] = useState<Record<number, boolean>>({});

  const validImages = images && images.length > 0 ? images : [''];
  const activeImage = validImages[activeIdx];
  const hasError = erroredIndices[activeIdx];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Large Frame */}
      <div className="w-full aspect-4/3 bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden relative flex items-center justify-center">
        {!hasError && activeImage ? (
          <img
            src={activeImage}
            alt={productName}
            onError={() => setErroredIndices((prev) => ({ ...prev, [activeIdx]: true }))}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-neutral-50 to-neutral-100 text-neutral-400">
            <Glasses className="w-20 h-20 stroke-[1] text-neutral-400 mb-2" />
            <span className="text-xs uppercase font-mono tracking-wider text-neutral-500">
              {modelCode}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails row */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`w-20 h-16 rounded border bg-neutral-50 overflow-hidden shrink-0 transition-all cursor-pointer ${
                activeIdx === idx
                  ? 'border-neutral-900 ring-2 ring-neutral-900/20'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {!erroredIndices[idx] && img ? (
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  onError={() => setErroredIndices((prev) => ({ ...prev, [idx]: true }))}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <Glasses className="w-5 h-5 stroke-[1]" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
