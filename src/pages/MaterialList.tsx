import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockMaterials } from '../mock/data';
import type { ProductKnowledge } from '../mock/productKnowledge';
import { useToast, useFavorites } from '../App';
import MaterialCard from '../components/MaterialCard';
import CopyModal from '../components/CopyModal';
import { copyText } from '../utils/clipboard';
import { getProductMainImage, searchProducts } from '../utils/productOverrides';
import { Search, Library, BookOpen, Copy, Tag } from 'lucide-react';

const mainEntries = [
  { key: 'product', label: '产品资料' },
  { key: 'moments', label: '朋友圈' },
  { key: 'xhs', label: '小红书' },
];

const seriesFilterOptions = ['全部', '怡然', '芸枫', 'Living', '枕头', '智能床'];

const sortOptions = [
  { key: 'default', label: '推荐优先' },
  { key: 'newest', label: '最新' },
] as const;

const excludedCategories = ['delivery', 'factory', 'activity'];
const excludedScenes = ['客户案例', '送货实拍', '门店活动', '工厂实拍'];
const excludedTerms = ['送货', '安装', '交付故事'];

function isLibraryMaterial(m: { category?: string; scene?: string; title?: string; content?: string; keywords?: string[] }): boolean {
  if (m.category && excludedCategories.includes(m.category)) return false;
  if (m.scene && excludedScenes.includes(m.scene)) return false;
  const haystack = [m.title || '', m.content || '', ...(m.keywords || [])].join(' ').toLowerCase();
  if (excludedTerms.some(t => haystack.includes(t))) return false;
  return true;
}

function matchesQuery(text: string | undefined, q: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(q);
}

function ProductKnowledgeCard({ product, onCopy }: { product: ProductKnowledge; onCopy: (text: string) => void }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-navy-100/70">
      <div onClick={() => navigate(`/product-knowledge/${product.id}`)} className="flex gap-3 p-3 active:bg-surface-50 cursor-pointer">
        <div className="w-[92px] h-[92px] rounded-xl overflow-hidden bg-surface-100 flex-shrink-0">
          <img src={getProductMainImage(product)} alt={`${product.series} ${product.model}`} className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex gap-1.5 mb-1.5 flex-wrap">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-navy-50 text-navy-700 font-medium border border-navy-100">
              <BookOpen size={10} className="inline mr-0.5" />产品资料
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{product.category}</span>
            {product.firmness && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-50 text-surface-500">{product.firmness}</span>}
          </div>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{product.series} · {product.model}</h3>
          <p className="text-xs text-surface-500 mt-1 line-clamp-2">{product.customerPageCopy}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {product.painPoints.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-50 text-surface-500">
                <Tag size={9} className="inline mr-0.5" />{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MaterialList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'product';
  const [activeCat, setActiveCat] = useState(initialCat);
  const [searchText, setSearchText] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('全部');
  const [sortKey, setSortKey] = useState<string>('default');
  const { showToast } = useToast();
  const { toggleFavorite, isFavorited } = useFavorites();
  const [copyModalText, setCopyModalText] = useState('');

  const productFiltered = useMemo(() => {
    if (activeCat !== 'product') return [];
    let list = searchProducts(searchText);
    if (seriesFilter !== '全部') {
      const filters = seriesFilter === '怡然' ? ['怡然', '怡风'] : [seriesFilter];
      list = list.filter(p => {
        const haystack = [p.series, p.model, p.category, p.firmness || '', ...p.keywords];
        return filters.some(f => haystack.some(text => text.includes(f)));
      });
    }
    return list;
  }, [activeCat, searchText, seriesFilter]);

  const filtered = useMemo(() => {
    if (activeCat === 'product') return [];
    let list = mockMaterials.filter(isLibraryMaterial);

    if (activeCat === 'moments') {
      list = list.filter(m => m.platforms.includes('微信朋友圈'));
    } else if (activeCat === 'xhs') {
      list = list.filter(m => m.platforms.includes('小红书'));
    }

    if (seriesFilter !== '全部') {
      list = list.filter(m =>
        (m.productSeries && m.productSeries.includes(seriesFilter))
      );
    }

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter(m =>
        matchesQuery(m.title, q) ||
        matchesQuery(m.content, q) ||
        matchesQuery(m.xhsContent, q) ||
        matchesQuery(m.productName, q) ||
        matchesQuery(m.productSeries, q) ||
        matchesQuery(m.productCategory, q) ||
        matchesQuery(m.productModel, q) ||
        m.keywords.some(k => k.toLowerCase().includes(q))
      );
    }

    if (sortKey === 'newest') {
      list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return list;
  }, [activeCat, searchText, seriesFilter, sortKey]);

  const entryCounts = useMemo(() => ({
    product: searchProducts('').length,
    moments: mockMaterials.filter(m => isLibraryMaterial(m) && m.platforms.includes('微信朋友圈')).length,
    xhs: mockMaterials.filter(m => isLibraryMaterial(m) && m.platforms.includes('小红书')).length,
  }), []);

  const handleCatChange = (cat: string) => {
    setActiveCat(cat);
    setSeriesFilter('全部');
    setSearchParams(cat === 'product' ? {} : { cat });
  };

  const handleCopy = async (text: string) => {
    const result = await copyText(text);
    if (result.success) {
      showToast('已复制，可直接粘贴发布');
    } else {
      setCopyModalText(text);
    }
  };

  const getCopyText = (m: typeof mockMaterials[number]) => {
    if (activeCat === 'xhs') return m.xhsContent || m.content;
    return m.content;
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 border-b border-surface-100">
        <h1 className="text-lg font-semibold text-gray-900 mb-3">素材库</h1>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜产品、型号、卖点，如：怡然、芸枫、腰背支撑"
            className="w-full h-10 pl-10 pr-4 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 placeholder-surface-400 focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-50 transition-all"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white px-4 py-2">
        <div className="flex gap-1.5 no-scrollbar overflow-x-auto">
          {mainEntries.map((entry) => {
            const isActive = activeCat === entry.key;
            const count = entryCounts[entry.key as keyof typeof entryCounts];
            return (
              <button
                key={entry.key}
                onClick={() => handleCatChange(entry.key)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-navy-800 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 active:bg-gray-50'
                }`}
              >
                {entry.label} <span className={`text-xs ml-0.5 ${isActive ? 'text-white/60' : 'text-gray-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Series filter + sort */}
      <div className="bg-white border-b border-surface-100 px-4 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1 no-scrollbar overflow-x-auto flex-1">
            {seriesFilterOptions.map((s) => (
              <button
                key={s}
                onClick={() => setSeriesFilter(s)}
                className={`flex-shrink-0 px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
                  seriesFilter === s
                    ? 'bg-navy-800 text-white'
                    : 'text-surface-400 active:bg-surface-50 active:text-surface-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex-shrink-0 flex gap-0.5 border-l border-surface-100 pl-2">
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                className={`px-1.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                  sortKey === opt.key
                    ? 'text-navy-700'
                    : 'text-surface-400 active:text-surface-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 pt-3 pb-4 space-y-3">
        {productFiltered.length === 0 && filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-surface-400">
            <Library size={48} strokeWidth={1} />
            <p className="mt-3 text-sm font-medium text-surface-500">暂无匹配内容</p>
            <p className="mt-1 text-xs text-surface-400 text-center leading-relaxed">
              可尝试搜索产品系列、型号或卖点
            </p>
          </div>
        ) : (
          <>
            {productFiltered.map(product => (
              <ProductKnowledgeCard key={product.id} product={product} onCopy={handleCopy} />
            ))}
            {filtered.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                onCopy={() => handleCopy(getCopyText(m))}
                onToggleFavorite={toggleFavorite}
                isFavorited={isFavorited(m.id)}
                showCaseCoinActions={false}
              />
            ))}
          </>
        )}
      </div>

      {copyModalText && (
        <CopyModal text={copyModalText} onClose={() => setCopyModalText('')} />
      )}
    </div>
  );
}

