import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../App';
import { addDeliveryTask, getInstallersByStore, getInstallersByCity, mockSalesPersons } from '../mock/data';
import type { DeliveryTask } from '../mock/data';
import { getAllProducts } from '../utils/productOverrides';
import type { ProductKnowledge } from '../mock/productKnowledge';
import { ArrowLeft, Truck, ChevronDown, ChevronUp, Search, X, Camera, Plus, Image } from 'lucide-react';

const sceneOptions = ['新房主卧', '新房次卧', '旧床换新', '父母房', '婚房布置', '儿童房', '客户卧室实拍', '门店试睡体验'];
const sizeOptions = ['1.5m × 2.0m', '1.8m × 2.0m', '2.0m × 2.2m'];

export default function DeliveryCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- Basic info --
  const [customerAlias, setCustomerAlias] = useState('');
  const [brand, setBrand] = useState('TEMPUR');
  const [model, setModel] = useState('');
  const [size, setSize] = useState('1.8m × 2.0m');
  const [city, setCity] = useState(user?.city || '');
  const [district, setDistrict] = useState('');
  const [scene, setScene] = useState('');
  const [requirement, setRequirement] = useState('');

  // -- Product picker --
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductKnowledge | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);

  // -- Capture mode --
  const [captureMode, setCaptureMode] = useState<'sales_upload' | 'installer_task'>('sales_upload');

  // -- Installer (only for installer_task mode) --
  const [selectedInstaller, setSelectedInstaller] = useState('');

  // -- Photo upload (for sales_upload mode) --
  const [photos, setPhotos] = useState<string[]>([]);

  // -- More fields toggle --
  const [showMore, setShowMore] = useState(false);

  const filteredProducts = useMemo(() => {
    const all = getAllProducts();
    if (!productSearch.trim()) return all;
    const q = productSearch.trim().toLowerCase();
    return all.filter(p =>
      p.series.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.keywords.some(k => k.toLowerCase().includes(q))
    );
  }, [productSearch]);

  const handleSelectProduct = (p: ProductKnowledge) => {
    setSelectedProductId(p.id);
    setSelectedProduct(p);
    setBrand('TEMPUR');
    setModel(p.model);
    setShowProductPicker(false);
    setProductSearch('');
  };

  const handleModelChange = (value: string) => {
    setModel(value);
    // If user manually edits model, break the link to selected product
    if (selectedProductId && selectedProduct?.model !== value) {
      setSelectedProductId('');
      setSelectedProduct(null);
    }
  };

  // -- Photo handling --
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const slots = Math.max(0, 9 - photos.length);
    Array.from(files).slice(0, slots).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotos(prev => [...prev, reader.result as string].slice(0, 9));
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const availableInstallers = user?.storeId
    ? getInstallersByStore(user.storeId)
    : getInstallersByCity(city || user?.city || '');

  const handleSubmit = () => {
    if (!customerAlias.trim()) { showToast('请填写客户称呼'); return; }
    if (!model.trim()) { showToast('请填写产品型号'); return; }
    if (!scene) { showToast('请选择交付场景'); return; }

    if (captureMode === 'sales_upload') {
      if (photos.length === 0) { showToast('请上传案例照片'); return; }
    } else {
      if (!selectedInstaller) { showToast('请选择安装师傅'); return; }
    }

    const isDealer = user?.role === 'dealer_owner';
    const sales = user?.role === 'sales'
      ? mockSalesPersons.find(s => s.userId === user.phone)
      : !isDealer
        ? mockSalesPersons.find(s => s.storeId === user?.storeId)
        : null;
    const submitterSalesId = isDealer ? user.phone : (sales?.id || '');
    const submitterSalesName = isDealer ? user.name : (sales?.name || user?.name || '');

    const activeProduct = selectedProductId ? selectedProduct : null;
    const productName = activeProduct
      ? `${activeProduct.series} ${activeProduct.model}`
      : brand;
    const productSeries = activeProduct?.series || model.trim();
    const productCategory = (activeProduct?.category || '床垫') as DeliveryTask['productCategory'];
    const productModel = activeProduct?.model || model.trim();
    const keywords = activeProduct
      ? [...activeProduct.keywords, scene].filter(Boolean)
      : [brand, model.trim(), scene].filter(Boolean);

    const installer = captureMode === 'installer_task'
      ? availableInstallers.find(i => i.id === selectedInstaller)
      : null;

    const isSalesUpload = captureMode === 'sales_upload';

    const newTask = addDeliveryTask({
      storeId: user?.storeId || '',
      storeName: user?.storeName || '',
      salesId: submitterSalesId,
      salesName: submitterSalesName,
      installerId: isSalesUpload ? '' : selectedInstaller,
      installerName: isSalesUpload ? '' : (installer?.name || ''),
      customerAlias: customerAlias.trim(),
      city: city || user?.city || '',
      district,
      scene,
      brand,
      model: activeProduct ? `${activeProduct.series} ${activeProduct.model}` : model.trim(),
      size,
      customerRequirement: requirement.trim(),
      authStatus: '可公开使用' as DeliveryTask['authStatus'],
      installImages: isSalesUpload ? photos : [],
      installStatus: isSalesUpload ? 'completed' : '',
      installNote: '',
      storyWhy: '',
      storyFocus: '',
      storyReason: '',
      storyFeedback: '',
      storyPublic: '',
      reviewStatus: isSalesUpload ? 'photos_uploaded' : 'draft',
      reviewNote: '',
      salesPoints: 0,
      installerPoints: 0,
      storePoints: 0,
      productName,
      productSeries,
      productCategory,
      productModel,
      keywords,
      privacyChecks: {
        hasFace: false,
        hasDoorNumber: false,
        hasPhoneOrAddress: false,
        hasDeliveryDocOrContract: false,
        hasPriceInfo: false,
        hasCompetitorBrand: false,
        hasClutteredScene: false,
      },
    });

    if (isSalesUpload) {
      showToast('案例已创建，请补充成交故事');
      setTimeout(() => navigate(`/delivery/detail/${newTask.id}`, { replace: true }), 800);
    } else {
      showToast('案例采集任务创建成功');
      setTimeout(() => navigate('/cases-hub?tab=mine'), 800);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">创建案例</h1>
      </div>

      <div className="px-4 py-4 space-y-4 pb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          {/* Customer Alias */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">客户称呼 <span className="text-red-400">*</span></label>
            <input type="text" value={customerAlias} onChange={(e) => setCustomerAlias(e.target.value)}
              placeholder="如：李女士（不填真实姓名）" className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" />
            <p className="text-[10px] text-gray-400 mt-1">仅填称呼即可，不记录客户真实全名</p>
          </div>

          {/* Product Picker */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">选择产品资料（可选）</label>
            <button onClick={() => setShowProductPicker(!showProductPicker)}
              className="w-full h-11 px-3 bg-navy-50 border border-navy-200 rounded-xl text-sm text-navy-700 font-medium flex items-center justify-between active:bg-navy-100 transition-colors">
              <span className="truncate">{selectedProduct ? `${selectedProduct.series} ${selectedProduct.model}` : (model || '从产品知识库选择，自动填充信息')}</span>
              <ChevronDown size={16} className={`text-navy-500 flex-shrink-0 ml-2 transition-transform ${showProductPicker ? 'rotate-180' : ''}`} />
            </button>
            {showProductPicker && (
              <div className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <input type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="搜索系列、型号、品类…" autoFocus
                    className="flex-1 h-8 bg-transparent text-sm focus:outline-none" />
                  {productSearch && (
                    <button onClick={() => setProductSearch('')} className="text-gray-400"><X size={14} /></button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">无匹配产品，可手动输入型号</p>
                  ) : (
                    filteredProducts.map((p) => (
                      <button key={p.id} onClick={() => handleSelectProduct(p)}
                        className="w-full px-4 py-3 text-left border-b border-gray-50 last:border-b-0 active:bg-navy-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-800">{p.series} {p.model}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{p.category}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{p.firmness} · {p.coreSellingPoints[0]}</p>
                      </button>
                    ))
                  )}
                </div>
                <button onClick={() => { setShowProductPicker(false); setProductSearch(''); }}
                  className="w-full py-2.5 text-xs text-gray-400 font-medium border-t border-gray-100 active:bg-gray-50">
                  关闭，手动输入型号
                </button>
              </div>
            )}
          </div>

          {/* Model */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">产品型号 <span className="text-red-400">*</span></label>
            <input type="text" value={model} onChange={(e) => handleModelChange(e.target.value)}
              placeholder="如：TEMPUR FORM™ 芸枫系列" className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" />
          </div>

          {/* Scene */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">交付场景 <span className="text-red-400">*</span></label>
            <div className="flex gap-2 flex-wrap">
              {sceneOptions.map((s) => (
                <button key={s} onClick={() => setScene(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    scene === s ? 'bg-primary-50 border-primary-400 text-primary-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Capture Mode */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">采集方式 <span className="text-red-400">*</span></label>
            <div className="flex gap-2">
              <button onClick={() => setCaptureMode('sales_upload')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                  captureMode === 'sales_upload' ? 'bg-primary-50 border-primary-400 text-primary-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                <Camera size={14} className="inline mr-1" />导购自己上传
              </button>
              <button onClick={() => setCaptureMode('installer_task')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                  captureMode === 'installer_task' ? 'bg-primary-50 border-primary-400 text-primary-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                <Truck size={14} className="inline mr-1" />安装师傅上门拍照
              </button>
            </div>
          </div>

          {/* Installer (only for installer_task) */}
          {captureMode === 'installer_task' && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                安装师傅 <span className="text-red-400">*</span>
                <span className="text-xs text-gray-400 font-normal ml-1">（{city || user?.city}可服务）</span>
              </label>
              {availableInstallers.length > 0 ? (
                <div className="space-y-2">
                  {availableInstallers.map((inst) => (
                    <button key={inst.id} onClick={() => setSelectedInstaller(inst.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        selectedInstaller === inst.id
                          ? 'bg-primary-50 border-primary-400'
                          : 'bg-gray-50 border-gray-200 active:bg-gray-100'
                      }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${selectedInstaller === inst.id ? 'text-primary-700' : 'text-gray-700'}`}>
                          <Truck size={14} className="inline mr-1" />{inst.name}
                        </span>
                        <span className="text-xs text-gray-400">{inst.team}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        服务城市：{inst.city} · 可服务门店：{inst.serviceStoreIds.map(sid => sid === 'store_sz' ? '苏州体验店' : '南京体验店').join('、')}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 rounded-xl p-3 text-amber-700 text-xs">
                  当前城市暂无可用安装师傅，请先联系管理员添加安装师傅账号。
                </div>
              )}
            </div>
          )}

          {/* Photo Upload (for sales_upload) */}
          {captureMode === 'sales_upload' && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                案例照片 <span className="text-red-400">*</span>
                <span className="text-xs text-gray-400 font-normal ml-1">（至少1张，最多9张）</span>
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {photos.map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden relative">
                    <img src={img} alt={`案例照片${i + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {photos.length < 9 && (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 active:bg-gray-50 transition-colors">
                    <Plus size={28} strokeWidth={1.5} />
                    <span className="text-xs">{photos.length === 0 ? '添加照片' : `${photos.length}/9`}</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
              <p className="text-[10px] text-gray-400">上传产品实拍、卧室环境、安装完成效果图，避免门牌号、手机号、合同、价格等隐私信息。</p>
            </div>
          )}

          {/* Toggle: more fields */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full flex items-center justify-between text-sm text-surface-500 font-medium py-1"
          >
            <span>更多信息（可选）</span>
            {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showMore && (
            <div className="space-y-4 pt-2">
              {/* Brand */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">产品品牌</label>
                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                  className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" />
              </div>

              {/* Size */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">产品尺寸</label>
                <div className="flex gap-2">
                  {sizeOptions.map((s) => (
                    <button key={s} onClick={() => setSize(s)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                        size === s ? 'bg-primary-50 border-primary-400 text-primary-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>

              {/* City */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">所在城市</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" />
              </div>

              {/* District */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">区域</label>
                <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)}
                  placeholder="如：工业园区" className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" />
              </div>

              {/* Requirement */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">客户需求</label>
                <textarea value={requirement} onChange={(e) => setRequirement(e.target.value)}
                  placeholder="如：次卧床垫，预算3000以内，喜欢偏硬一点的…" rows={3}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-primary-400 transition-colors" />
              </div>
            </div>
          )}

          {/* Installer task: associate optional installer in more info */}
          {captureMode === 'sales_upload' && showMore && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">关联安装师傅（可选）</label>
              {availableInstallers.length > 0 ? (
                <div className="space-y-2">
                  <button onClick={() => setSelectedInstaller('')}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      !selectedInstaller ? 'bg-primary-50 border-primary-400' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <span className="text-sm font-medium text-gray-500">不关联安装师傅</span>
                  </button>
                  {availableInstallers.map((inst) => (
                    <button key={inst.id} onClick={() => setSelectedInstaller(inst.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        selectedInstaller === inst.id
                          ? 'bg-primary-50 border-primary-400'
                          : 'bg-gray-50 border-gray-200 active:bg-gray-100'
                      }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700"><Truck size={14} className="inline mr-1" />{inst.name}</span>
                        <span className="text-xs text-gray-400">{inst.team}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">当前城市暂无可用安装师傅</p>
              )}
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800">隐私提醒</p>
          <p className="text-xs text-amber-700 mt-1">
            本系统不记录客户详细地址、手机号、门牌号、小区楼栋房号等信息。<br/>
            送货地址由门店通过微信、电话、ERP等方式单独告知安装师傅。
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800">
            {captureMode === 'sales_upload' ? '创建案例之后' : '创建案例采集之后'}
          </p>
          {captureMode === 'sales_upload' ? (
            <p className="text-xs text-blue-600 mt-1">
              提交后进入案例审核，审核通过后沉淀为案例素材。
            </p>
          ) : (
            <p className="text-xs text-blue-600 mt-1">
              1. 安装师傅将收到案例采集通知，上门安装并拍照<br/>
              2. 安装完成后，销售需要补充客户成交故事<br/>
              3. 管理员审核通过后，销售和安装师傅都将获得积分
            </p>
          )}
        </div>

        <button onClick={handleSubmit}
          className="w-full h-12 bg-primary-600 text-white font-semibold rounded-xl text-base active:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
          {captureMode === 'sales_upload' ? '创建案例' : '创建案例采集任务'}
        </button>
      </div>
    </div>
  );
}
