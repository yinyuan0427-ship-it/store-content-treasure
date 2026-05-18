import { useNavigate } from 'react-router-dom';
import { getAllProducts, hasProductOverride, getProductMainImage, isCreatedProduct } from '../utils/productOverrides';
import { ArrowLeft, Pencil, Plus } from 'lucide-react';

export default function AdminProducts() {
  const navigate = useNavigate();
  const allProducts = getAllProducts();

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <div className="bg-navy-900 text-white px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-semibold">产品资料管理</h1>
          </div>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="h-8 px-3 bg-white/15 rounded-full text-sm font-medium flex items-center gap-1 active:bg-white/25"
          >
            <Plus size={16} />新增产品
          </button>
        </div>
        <p className="text-xs text-white/60">管理产品图片和文案，修改后产品资料库和详情页会同步更新</p>
      </div>

      <div className="flex-1 px-4 pt-3 pb-4 space-y-2">
        {allProducts.map(product => {
          const builtInEdited = hasProductOverride(product.id);
          const created = isCreatedProduct(product.id);
          const tag = created ? '新增' : builtInEdited ? '已修改' : null;
          const mainImage = getProductMainImage(product);
          return (
            <div
              key={product.id}
              onClick={() => navigate(`/admin/products/${product.id}`)}
              className="bg-white rounded-xl p-3 flex items-center gap-3 active:bg-surface-50 cursor-pointer shadow-card border border-surface-100/50"
            >
              <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
                <img src={mainImage} alt={product.model} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-900">{product.series}</p>
                  {tag && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
                      created ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'
                    }`}>{tag}</span>
                  )}
                </div>
                <p className="text-xs text-surface-500 mt-0.5">{product.model} · {product.category}</p>
                {product.firmness && <p className="text-[10px] text-surface-400 mt-0.5">{product.firmness}</p>}
              </div>
              <Pencil size={16} className="text-surface-300 flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
