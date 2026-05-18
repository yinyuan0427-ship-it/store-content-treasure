import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Copy, Lightbulb, Sparkles, Tag, Users, Image } from 'lucide-react';
import { copyText } from '../utils/clipboard';
import { getProductById, getProductMainImage, getProductImages } from '../utils/productOverrides';
import { useToast } from '../App';
import CopyModal from '../components/CopyModal';

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-surface-600 whitespace-pre-wrap leading-relaxed">{text}</p>
    </div>
  );
}

export default function ProductKnowledgeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [copyModalText, setCopyModalText] = useState('');
  const product = getProductById(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-5">
        <div className="text-center">
          <BookOpen size={44} className="mx-auto text-surface-300 mb-3" />
          <p className="text-gray-700 font-semibold mb-4">产品资料不存在</p>
          <button onClick={() => navigate('/library?cat=product')} className="text-navy-700 font-medium">返回产品资料</button>
        </div>
      </div>
    );
  }

  const copy = async (text: string) => {
    const result = await copyText(text);
    if (result.success) showToast('已复制，可直接发给客户或整理成素材');
    else setCopyModalText(text);
  };


  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <div className="relative bg-navy-900 text-white">
        <button onClick={() => navigate('/library?cat=product')} className="absolute top-12 left-4 z-10 w-9 h-9 rounded-full bg-black/30 flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <img src={getProductMainImage(product)} alt={`${product.series} ${product.model}`} className="w-full aspect-[4/3] object-cover opacity-80" />
        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-navy-950/95 to-transparent">
          <div className="flex gap-2 mb-2">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/15 border border-white/20">{product.category}</span>
            {product.firmness && <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/15 border border-white/20">{product.firmness}</span>}
          </div>
          <h1 className="text-xl font-bold leading-snug">{product.series}</h1>
          <p className="text-sm text-white/75 mt-1">{product.model}</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 pb-28 space-y-4">
        {(() => {
          const images = getProductImages(product);
          if (images.length <= 1) return null;
          return (
            <div className="bg-white rounded-2xl p-4 shadow-card">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
                <Image size={16} className="text-navy-500" />产品图片
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {images.map((src, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-surface-100">
                    <img src={src} alt={`${product.model} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
            <Sparkles size={16} className="text-warm-500" />核心卖点
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {product.coreSellingPoints.map(point => (
              <div key={point} className="text-xs text-navy-700 bg-navy-50 rounded-xl px-3 py-2">{point}</div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
            <Users size={16} className="text-green-600" />适合客户
          </h2>
          <div className="flex flex-wrap gap-2">
            {product.fitCustomers.map(item => (
              <span key={item} className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700">{item}</span>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-surface-100">
            <p className="text-xs text-surface-400 mb-2">解决痛点</p>
            <div className="flex flex-wrap gap-2">
              {product.painPoints.map(item => (
                <span key={item} className="text-xs px-3 py-1.5 rounded-full bg-surface-50 text-surface-600">{item}</span>
              ))}
            </div>
          </div>
        </div>

        <TextBlock title="导购介绍话术" text={product.salesScript} />

        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
            <Lightbulb size={16} className="text-warm-500" />客户常见疑问
          </h3>
          <div className="space-y-3">
            {product.objectionReplies.map(item => (
              <div key={item.question} className="bg-surface-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-800">{item.question}</p>
                <p className="text-xs text-surface-600 mt-1 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <TextBlock title="客户页展示文案" text={product.customerPageCopy} />
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/95 backdrop-blur border-t border-surface-100 z-40 safe-bottom">
        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          <button onClick={() => copy(product.momentsCopy)} className="h-11 bg-green-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5">
            <Copy size={15} />朋友圈
          </button>
          <button onClick={() => copy(product.xhsCopy)} className="h-11 bg-red-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5">
            <Copy size={15} />小红书
          </button>
          <button onClick={() => copy(product.salesScript)} className="h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5">
            <Tag size={15} />话术
          </button>
        </div>
      </div>

      {copyModalText && <CopyModal text={copyModalText} onClose={() => setCopyModalText('')} />}
    </div>
  );
}

