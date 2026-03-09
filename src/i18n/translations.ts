export type Locale = 'tr' | 'en';

export const defaultLocale: Locale = 'tr';

export const translations = {
  tr: {
    // Header
    'nav.shop': 'Mağaza',
    'nav.collections': 'Koleksiyonlar',
    'nav.brand': 'Hakkımızda',
    'nav.shopAll': 'Tüm Ürünler',

    // Collections
    'col.allProducts': 'Tüm Ürünler',
    'col.hoodies': 'Sweatshirt',
    'col.sweatpants': 'Eşofman',
    'col.tshirts': 'T-Shirt',
    'col.accessories': 'Aksesuar',
    'col.allProducts.desc': 'Tüm Over2You koleksiyonunu keşfet',
    'col.hoodies.desc': 'Premium ağır sweatshirt ve crewneck\'ler',
    'col.sweatpants.desc': 'Rahat kesim eşofman ve kargo pantolonlar',
    'col.tshirts.desc': 'Oversize temel tişörtler ve atletler',
    'col.accessories.desc': 'Bereler, şapkalar ve daha fazlası',
    'col.products': 'ürün',

    // Hero
    'hero.tagline': 'Premium Streetwear — İstanbul',
    'hero.cta': 'Alışverişe Başla',
    'hero.scroll': 'Aşağı Kaydır',

    // Collection Banners
    'banner.collection': 'Koleksiyon',
    'banner.essentials': 'Temel Parçalar',
    'banner.newDrop': 'Yeni Sezon',
    'banner.hoodies.sub': 'Yeni renkler çevrimiçi',
    'banner.tshirts.sub': 'Oversize kesim',
    'banner.bottoms': 'Alt Giyim',
    'banner.bottoms.sub': 'Eşofman & Kargo',

    // Products
    'products.newArrivals': 'Yeni Gelenler',
    'products.viewAll': 'Tümünü Gör',
    'products.allProducts': 'Tüm Ürünler',
    'products.soldOut': 'Tükendi',
    'products.addToCart': 'Sepete Ekle',
    'products.youMightLike': 'Beğenebileceğiniz',
    'products.color': 'Renk',
    'products.size': 'Beden',
    'products.sizeGuide': 'Beden Rehberi',
    'products.productInfo': 'Ürün Bilgisi',
    'products.material': 'Malzeme',
    'products.careInstructions': 'Bakım Talimatları',
    'products.sizeInfo': 'Beden Bilgisi',
    'products.sizeDesc': 'Ürünlerimiz rahat, oversize kesim takip eder. Amaçlanan görünüm için normal bedeninizi seçmenizi, daha dar bir stil için bir beden küçüğünü tercih etmenizi öneririz.',
    'products.shipping': 'Kargo & İade',
    'products.shippingDesc': '1.000 TL üzeri siparişlerde ücretsiz kargo. Türkiye içi standart teslimat 2-4 iş günü.',
    'products.returnsDesc': 'Teslimat tarihinden itibaren 14 gün içinde iade kabul edilir. Ürünler giyilmemiş ve orijinal etiketleri takılı olmalıdır.',

    // Filters
    'filter.color': 'Renk',
    'filter.size': 'Beden',
    'filter.inStockOnly': 'Sadece Stokta',
    'filter.filters': 'Filtreler',

    // Brand Page
    'brand.title': 'Sıra Sende',
    'brand.intro': 'Over2You basit bir fikirden doğdu: premium streetwear ulaşılmaz olmamalı. İstanbul\'da kurulan markamız, her parçayı özenle tasarlıyor — sokak kültürü estetiğini hak ettiğiniz kaliteyle birleştirerek.',
    'brand.intro2': 'Her iplik, her dikiş, her tasarım kararı bilinçli. Trendleri takip etmiyoruz — onları biz yaratıyoruz.',
    'brand.v1.num': '01',
    'brand.v1.title': 'Önce Kalite',
    'brand.v1.desc': 'Premium malzemeler, ağır kumaşlar ve titiz üretim. Her parça uzun ömürlü olacak şekilde üretilir.',
    'brand.v2.num': '02',
    'brand.v2.title': 'İstanbul\'da Üretildi',
    'brand.v2.desc': 'Yerel olarak tasarlanır ve üretilir. Türk zanaatını desteklerken çevresel etkimizi azaltıyoruz.',
    'brand.v3.num': '03',
    'brand.v3.title': 'Senin Kimliğin',
    'brand.v3.desc': 'Seni temsil edeni giy. Over2You bir kıyafetten fazlası — kendini ifade etmenin tuvali.',
    'brand.explore': 'Keşfet',
    'brand.more': 'Devamı',

    // Brand Cards
    'brand.card.lookbook.tag': 'Lookbook',
    'brand.card.lookbook.title': 'SS26 Koleksiyon',
    'brand.card.lookbook.desc': 'Sokak kültürünü premium işçilikle buluşturan son İlkbahar/Yaz koleksiyonumuz.',
    'brand.card.collab.tag': 'İş Birliği',
    'brand.card.collab.title': 'Over2You x İstanbul',
    'brand.card.collab.desc': 'Bize ilham veren şehre bir aşk mektubu. Sınırlı sayıda kapsül koleksiyon.',
    'brand.card.workshop.tag': 'Sahne Arkası',
    'brand.card.workshop.title': 'Atölyemiz',
    'brand.card.workshop.desc': 'Her parça İstanbul atölyemizde tasarlanır ve kalite kontrolünden geçer.',
    'brand.card.community.tag': 'Topluluk',
    'brand.card.community.title': 'Over2You Kolektif',
    'brand.card.community.desc': 'Kimliğini giyen yaratıcılar, sporcular ve bireylerden oluşan topluluğumuza katıl.',
    'brand.card.sustainability.tag': 'Sürdürülebilirlik',
    'brand.card.sustainability.title': 'Bilinçli Üretim',
    'brand.card.sustainability.desc': 'Malzemeleri sorumlu kaynaklardan temin eder, çevresel ayak izimizi en aza indirmek için yerel üretim yaparız.',
    'brand.card.culture.tag': 'Kültür',
    'brand.card.culture.title': 'Sokak Stüdyoyla Buluşuyor',
    'brand.card.culture.desc': 'Yeraltı kültürünün titiz tasarımla buluştuğu yer. Over2You tam bu kesişim noktasında yaşıyor.',

    // Brand Banner
    'brandBanner.title': 'SIRA SENDE',
    'brandBanner.desc': 'Over2You bir markadan fazlası. Bir duruş. İstanbul\'da tasarlanıp üretilen premium kalite streetwear.',
    'brandBanner.cta': 'Hikayemiz',

    // Footer
    'footer.newsletter': 'Haberdar Ol',
    'footer.newsletterDesc': 'Erken erişim, özel sezonlar ve daha fazlası için abone ol.',
    'footer.email': 'E-posta adresin',
    'footer.subscribe': 'Abone Ol',
    'footer.shop': 'Mağaza',
    'footer.info': 'Bilgi',
    'footer.aboutUs': 'Hakkımızda',
    'footer.sizeGuide': 'Beden Rehberi',
    'footer.shipping': 'Kargo',
    'footer.returns': 'İade',
    'footer.legal': 'Yasal',
    'footer.privacy': 'Gizlilik Politikası',
    'footer.terms': 'Kullanım Koşulları',
    'footer.cookies': 'Çerez Politikası',
    'footer.followUs': 'Bizi Takip Et',
    'footer.rights': 'Tüm hakları saklıdır.',

    // Badges
    'badge.new': 'YENİ',
    'badge.lastStock': 'SON STOK',
    'badge.updated': 'GÜNCELLENDİ',

    // Product detail table
    'table.size': 'Beden',
    'table.chest': 'Göğüs (cm)',
    'table.length': 'Boy (cm)',

    // Breadcrumb
    'breadcrumb.home': 'Ana Sayfa',

    // Language
    'lang.switch': 'EN',
  },

  en: {
    'nav.shop': 'Shop',
    'nav.collections': 'Collections',
    'nav.brand': 'Brand',
    'nav.shopAll': 'Shop All',

    'col.allProducts': 'All Products',
    'col.hoodies': 'Hoodies',
    'col.sweatpants': 'Sweatpants',
    'col.tshirts': 'T-Shirts',
    'col.accessories': 'Accessories',
    'col.allProducts.desc': 'Shop the full Over2You collection',
    'col.hoodies.desc': 'Premium heavyweight hoodies & crewnecks',
    'col.sweatpants.desc': 'Relaxed fit sweatpants & cargos',
    'col.tshirts.desc': 'Essential oversized tees & tanks',
    'col.accessories.desc': 'Beanies, caps & more',
    'col.products': 'products',

    'hero.tagline': 'Premium Streetwear — Istanbul',
    'hero.cta': 'Shop Now',
    'hero.scroll': 'Scroll',

    'banner.collection': 'Collection',
    'banner.essentials': 'Essentials',
    'banner.newDrop': 'New Drop',
    'banner.hoodies.sub': 'New colors online',
    'banner.tshirts.sub': 'Oversized basics',
    'banner.bottoms': 'Bottoms',
    'banner.bottoms.sub': 'Sweatpants & Cargos',

    'products.newArrivals': 'New Arrivals',
    'products.viewAll': 'View All',
    'products.allProducts': 'All Products',
    'products.soldOut': 'Sold Out',
    'products.addToCart': 'Add to Cart',
    'products.youMightLike': 'You Might Also Like',
    'products.color': 'Color',
    'products.size': 'Size',
    'products.sizeGuide': 'Size Guide',
    'products.productInfo': 'Product Information',
    'products.material': 'Material',
    'products.careInstructions': 'Care Instructions',
    'products.sizeInfo': 'Size Information',
    'products.sizeDesc': 'Our garments follow a relaxed, oversized fit. We recommend choosing your regular size for the intended look, or sizing down for a more fitted style.',
    'products.shipping': 'Shipping & Returns',
    'products.shippingDesc': 'Free shipping on orders over 1,000 TL. Standard delivery 2-4 business days within Turkey.',
    'products.returnsDesc': 'Returns accepted within 14 days of delivery. Items must be unworn with original tags attached.',

    'filter.color': 'Color',
    'filter.size': 'Size',
    'filter.inStockOnly': 'In Stock Only',
    'filter.filters': 'Filters',

    'brand.title': 'It\'s Your Turn',
    'brand.intro': 'Over2You was born from a simple idea: premium streetwear shouldn\'t be out of reach. Founded in Istanbul, we craft each piece with intention — blending street culture aesthetics with the quality you deserve.',
    'brand.intro2': 'Every thread, every stitch, every design choice is deliberate. We don\'t follow trends — we create them.',
    'brand.v1.num': '01',
    'brand.v1.title': 'Quality First',
    'brand.v1.desc': 'Premium materials, heavyweight fabrics, and meticulous construction. Every piece is built to last.',
    'brand.v2.num': '02',
    'brand.v2.title': 'Made in Istanbul',
    'brand.v2.desc': 'Designed and produced locally. Supporting Turkish craftsmanship while reducing our environmental impact.',
    'brand.v3.num': '03',
    'brand.v3.title': 'Your Identity',
    'brand.v3.desc': 'Wear what represents you. Over2You is more than clothing — it\'s a canvas for self-expression.',
    'brand.explore': 'Explore',
    'brand.more': 'More',

    'brand.card.lookbook.tag': 'Lookbook',
    'brand.card.lookbook.title': 'SS26 Collection',
    'brand.card.lookbook.desc': 'Our latest Spring/Summer collection blending street culture with premium craftsmanship.',
    'brand.card.collab.tag': 'Collaboration',
    'brand.card.collab.title': 'Over2You x Istanbul',
    'brand.card.collab.desc': 'A love letter to the city that inspires us. Limited edition capsule collection.',
    'brand.card.workshop.tag': 'Behind the Brand',
    'brand.card.workshop.title': 'Our Workshop',
    'brand.card.workshop.desc': 'Every piece is designed and quality-checked in our Istanbul atelier.',
    'brand.card.community.tag': 'Community',
    'brand.card.community.title': 'Over2You Collective',
    'brand.card.community.desc': 'Join our community of creatives, athletes, and individuals who wear their identity.',
    'brand.card.sustainability.tag': 'Sustainability',
    'brand.card.sustainability.title': 'Conscious Craft',
    'brand.card.sustainability.desc': 'We source premium materials responsibly and manufacture locally to minimize our footprint.',
    'brand.card.culture.tag': 'Culture',
    'brand.card.culture.title': 'Street Meets Studio',
    'brand.card.culture.desc': 'Where underground culture meets meticulous design. That intersection is where Over2You lives.',

    'brandBanner.title': 'IT\'S YOUR TURN',
    'brandBanner.desc': 'Over2You is more than a brand. It\'s a statement. Premium quality streetwear designed and crafted in Istanbul.',
    'brandBanner.cta': 'Our Story',

    'footer.newsletter': 'Stay in the Loop',
    'footer.newsletterDesc': 'Subscribe for early access, exclusive drops, and more.',
    'footer.email': 'Your email',
    'footer.subscribe': 'Subscribe',
    'footer.shop': 'Shop',
    'footer.info': 'Info',
    'footer.aboutUs': 'About Us',
    'footer.sizeGuide': 'Size Guide',
    'footer.shipping': 'Shipping',
    'footer.returns': 'Returns',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookie Policy',
    'footer.followUs': 'Follow Us',
    'footer.rights': 'All rights reserved.',

    'badge.new': 'NEW',
    'badge.lastStock': 'LAST STOCK',
    'badge.updated': 'UPDATED',

    'table.size': 'Size',
    'table.chest': 'Chest (cm)',
    'table.length': 'Length (cm)',

    'breadcrumb.home': 'Home',

    'lang.switch': 'TR',
  },
} as const;

export type TranslationKey = keyof typeof translations.tr;

export function getLocale(): Locale {
  if (typeof document !== 'undefined') {
    return (localStorage.getItem('lang') as Locale) || defaultLocale;
  }
  return defaultLocale;
}

export function t(key: TranslationKey, locale: Locale = defaultLocale): string {
  return translations[locale]?.[key] || translations[defaultLocale][key] || key;
}
