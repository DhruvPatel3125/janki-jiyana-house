import React from 'react';
import { Sparkles, Check, ShieldCheck, Heart, Award } from 'lucide-react';

export const APlusContentRenderer = ({ aPlusContent = [], description = '', detailImages = [] }) => {
  // If no A+ blocks exist, render high-grade fallback with detailImages + text description
  if (!aPlusContent || aPlusContent.length === 0) {
    return (
      <div className="space-y-8 py-6">
        <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Product Overview & Specifications
            </h2>
            <p className="text-xs text-slate-500 font-medium">Detailed features and product description</p>
          </div>
        </div>

        {/* Detail Images Stack */}
        {detailImages && detailImages.length > 0 && (
          <div className="space-y-4">
            {detailImages.map((imgUrl, idx) => (
              <div key={idx} className="w-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-white p-2 sm:p-4">
                <img 
                  src={imgUrl} 
                  alt={`Detail View ${idx + 1}`} 
                  loading="lazy" 
                  className="w-full h-auto object-contain rounded-2xl"
                />
              </div>
            ))}
          </div>
        )}

        {/* Text Description */}
        {description && (
          <div className="bg-slate-50/70 p-5 sm:p-8 rounded-3xl border border-slate-200/60 text-slate-700 text-sm sm:text-base leading-relaxed space-y-3 font-medium">
            {description.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
              <p key={idx} className="leading-relaxed">
                {line.replace(/^[-\d.)]+\s*/, '')}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!aPlusContent || aPlusContent.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12 sm:space-y-16 py-6">
      {/* Amazon A+ Content Brand Header */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4">
        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm">
          <Award className="w-3.5 h-3.5" /> Enhanced Brand Experience A+
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          From the Brand
        </h2>
      </div>

      {aPlusContent.map((block, index) => {
        switch (block.type) {
          // 1. HERO BANNER BLOCK
          case 'hero_banner':
            return (
              <div key={index} className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-md group">
                {block.image && (
                  <img
                    src={block.image}
                    alt={block.title || 'Brand Hero Banner'}
                    className="w-full h-auto max-h-[500px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                )}
                {(block.title || block.subtitle || block.description) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-900/20 p-6 sm:p-12 flex flex-col justify-end text-white">
                    {block.title && (
                      <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                        {block.title}
                      </h3>
                    )}
                    {block.subtitle && (
                      <p className="text-teal-300 font-bold text-xs sm:text-sm mt-1.5 sm:mt-2.5 uppercase tracking-widest drop-shadow">
                        {block.subtitle}
                      </p>
                    )}
                    {block.description && (
                      <p className="text-slate-100 text-xs sm:text-sm max-w-2xl mt-2 line-clamp-3 leading-relaxed font-medium drop-shadow">
                        {block.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );

          // 2. FEATURE SPLIT (Z-PATTERN LAYOUT)
          case 'feature_split': {
            const isReversed = index % 2 === 1;
            return (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={`space-y-4 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                  {block.subtitle && (
                    <span className="text-xs font-black uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100 inline-block">
                      {block.subtitle}
                    </span>
                  )}
                  {block.title && (
                    <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                      {block.title}
                    </h3>
                  )}
                  {block.description && (
                    <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                      {block.description}
                    </p>
                  )}
                </div>

                {block.image && (
                  <div className={`aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-4 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                    <img
                      src={block.image}
                      alt={block.title || 'Feature view'}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            );
          }

          // 3. THREE-COLUMN CARDS GRID
          case 'three_cards':
            return (
              <div key={index} className="space-y-6">
                {block.title && (
                  <div className="text-center max-w-xl mx-auto space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {block.title}
                    </h3>
                    {block.subtitle && (
                      <p className="text-xs text-slate-500 font-semibold">{block.subtitle}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(block.cards || []).map((card, cIdx) => (
                    <div
                      key={cIdx}
                      className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4"
                    >
                      {card.image && (
                        <div className="aspect-[4/3] w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-3">
                          <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                          {card.title}
                        </h4>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          // 4. COMPARISON TABLE MATRIX
          case 'comparison_table':
            return (
              <div key={index} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 overflow-hidden">
                {block.title && (
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {block.title}
                  </h3>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px]">
                        {(block.comparisonTable?.headers || ['Product', 'Size / Absorptions', 'Special Feature']).map((h, hIdx) => (
                          <th key={hIdx} className="py-3 px-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {(block.comparisonTable?.rows || []).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 flex items-center gap-3 font-extrabold text-slate-900">
                            {row.productImage && (
                              <img src={row.productImage} alt={row.productName} className="w-8 h-8 rounded-lg object-contain bg-slate-50 p-1 border border-slate-200" />
                            )}
                            {row.productName}
                          </td>
                          {(row.features || []).map((feat, fIdx) => (
                            <td key={fIdx} className="py-3 px-4 text-slate-600">{feat}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
