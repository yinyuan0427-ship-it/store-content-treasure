// ============================================================
// Image resource helpers
// All images live under public/assets/images/
// ============================================================

const local = (filename: string) => `/assets/images/${filename}`;

const productLocal = (filename: string) => local(`products/${filename}`);

const productImages: Record<string, string> = {
  'tempur-pro-yiran-soft': productLocal('tempur-pro-yiran-soft.jpg'),
  'tempur-pro-yiran-medium': productLocal('tempur-pro-yiran-medium.jpg'),
  'tempur-pro-yiran-medium-firm': productLocal('tempur-pro-yiran-medium-firm.jpg'),
  'tempur-pro-yiran-firm': productLocal('tempur-pro-yiran-firm.jpg'),
  'tempur-pro-air-yifeng-medium': productLocal('tempur-pro-air-yifeng-medium.jpg'),
  'tempur-form-original': productLocal('tempur-form-original.jpg'),
  'tempur-form-plus': productLocal('tempur-form-plus.jpg'),
  'tempur-living-mercurie': productLocal('tempur-living-mercurie.jpg'),
  'tempur-living-saturn': productLocal('tempur-living-saturn.jpg'),
  'tempur-living-cyres': productLocal('tempur-living-cyres.jpg'),
  'tempur-pillow-original': productLocal('tempur-pillow-original.jpg'),
  'tempur-pillow-neck': productLocal('tempur-pillow-neck.jpg'),
  'tempur-pillow-crescent': productLocal('tempur-pillow-crescent.jpg'),
  'tempur-pillow-butterfly': productLocal('tempur-pillow-butterfly.jpg'),
  'tempur-pillow-soft': productLocal('tempur-pillow-soft.jpg'),
  'tempur-living-pillow-dream': productLocal('tempur-living-pillow-dream.jpg'),
  'tempur-smart-ergo': productLocal('tempur-smart-ergo.jpg'),
};

const library: Record<string, string[]> = {
  mattress: [
    'tempur-mattress-01.jpg',
    'tempur-mattress-02.png',
  ],
  bedroom: [
    'tempur-bedroom-01.jpg',
    'tempur-bedroom-02.png',
    'tempur-bedroom-03.png',
  ],
  luxury: [
    'tempur-bedroom-01.jpg',
    'tempur-bedroom-02.png',
    'tempur-bedroom-03.png',
  ],
  store: [
    'tempur-bedroom-01.jpg',
    'tempur-bedroom-02.png',
    'tempur-bedroom-03.png',
  ],
  delivery: [
    'delivery-bedroom-01.jpg',
    'delivery-bedroom-01.png',
    'delivery-bedroom-02.jpg',
    'delivery-bedroom-02.png',
  ],
  factory: [
    'delivery-bedroom-01.jpg',
    'delivery-bedroom-02.jpg',
  ],
  pillow: [
    'tempur-pillow-01.png',
  ],
  detail: [
    'tempur-mattress-01.jpg',
    'tempur-mattress-02.png',
    'tempur-pillow-01.png',
  ],
  case: [
    'case-suzhou-bedroom-01.png',
    'case-suzhou-bedroom-02.png',
    'case-suzhou-bedroom-03.png',
  ],
};

function pick(list: string[], index: number): string {
  return local(list[index % list.length]);
}

export function productImage(productId: string): string {
  return productImages[productId] || local('tempur-mattress-01.jpg');
}

export function mattressImg(index: number, _w?: number, _h?: number): string {
  return pick(library.mattress, index);
}

export function bedImg(index: number, _w?: number, _h?: number): string {
  return pick(library.bedroom, index);
}

export function luxuryImg(index: number, _w?: number, _h?: number): string {
  return pick(library.luxury, index);
}

export function storeImg(index: number, _w?: number, _h?: number): string {
  return pick(library.store, index);
}

export function deliveryImg(index: number, _w?: number, _h?: number): string {
  return pick(library.delivery, index);
}

export function factoryImg(index: number, _w?: number, _h?: number): string {
  return pick(library.factory, index);
}

export function pillowImg(index: number, _w?: number, _h?: number): string {
  return pick(library.pillow, index);
}

export function detailImg(index: number, _w?: number, _h?: number): string {
  return pick(library.detail, index);
}

export function caseImg(index: number, _w?: number, _h?: number): string {
  return pick(library.case, index);
}

export function img(_seed?: string, _w?: number, _h?: number): string {
  return local('tempur-bedroom-01.jpg');
}
