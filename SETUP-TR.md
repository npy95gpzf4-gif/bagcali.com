# BAGCALI Trade demo kurulumu

## Bu sürüm

- Ana sitenin mevcut public/ dosyaları korunur.
- /trade/ uygulaması sekiz borsayı listeler: Binance, OKX, Coinbase, Upbit, Bybit, Bitget, Gate ve KuCoin.
- Üyelik, oturum ve şifre sıfırlama Supabase Auth kullanır. Supabase projesi bağlanmadan üyelik devre dışıdır.
- Borsa bağlantıları ve emirler simülasyondur. Borsa anahtarı alanları salt okunur örneklerdir; gerçek anahtar alınmaz.
- 10.000 sanal USDT ve sabit örnek fiyatlar kullanılır. Piyasa verisi veya gerçek bot bağlantısı yoktur.
- Demo bağlantıları ve emirleri bellektedir; yenilemede ve çıkışta sıfırlanır. Auth kullanıcıları seçilen Supabase projesinde tutulur. Henüz işlem verisi için tablo/migrasyon yoktur.

## 1. GitHub

Repo: https://github.com/npy95gpzf4-gif/bagcali.com

Kaynak ZIP'in içeriğini repo köküne yükleyin. node_modules, dist ve gerçek .env dosyalarını yüklemeyin. Repo public olduğundan hiçbir özel anahtar, borsa anahtarı veya parola eklemeyin. Proje bu repoda tutulur. Bu proje için npy95gpzf4-gif GitHub bağlantısı kullanılır.

## 2. Farklı hesaptaki Supabase

1. Yeni BAGCALI projesini oluşturun.
2. Project Settings / API Keys bölümünden proje URL'sini ve `sb_publishable_` ile başlayan publishable key'i alın. Secret veya service_role key kullanmayın.
3. Auth / Providers altında Email girişini ve e-posta doğrulamasını etkinleştirin. Parola alt sınırını 12 yapın. Gerçek kullanıcılar için SMTP sağlayıcısını yapılandırın.
4. Auth / URL Configuration içinde Site URL'yi erişilecek demo origin'i olarak ayarlayın. Redirect URLs listesine şunları ekleyin:
   - https://NETLIFY-SITE-ADINIZ.netlify.app/trade/
   - Proxy tamamlandığında https://bagcali.com/trade/
5. E-posta doğrulama ve sıfırlama bağlantıları aynı tarayıcıda açılacak PKCE akışı kullanır. Farklı cihazda doğrulama gerekirse e-posta OTP akışı ayrıca tasarlanmalıdır.

Bu sürüm Supabase Auth'un kullanıcı deposunu kullanır; key saklama veya al-sat için database tabloları oluşturmaz.

## 3. Farklı hesaptaki Netlify

1. Add new project / Import an existing project üzerinden GitHub reposunu seçin. O Netlify hesabına GitHub repo erişimi verin.
2. Repo kökü base directory'dir. Build command: `npm run build`. Publish directory: `dist`. netlify.toml aynı ayarları içerir.
3. Project configuration / Environment variables bölümünde iki public build değişkeni tanımlayın:
   - VITE_SUPABASE_URL = https://PROJE-REF.supabase.co
   - VITE_SUPABASE_PUBLISHABLE_KEY = sb_publishable_...
4. Node 24 kullanın. Değişkenlerden sonra yeniden deploy edin; VITE_ değişkenleri derleme sırasında tarayıcı koduna dahil edilir.
5. Önce https://NETLIFY-SITE-ADINIZ.netlify.app/trade/ adresinde kayıt, e-posta doğrulama, giriş, sıfırlama ve çıkış testlerini tamamlayın.
6. Ortam değişkenleri yoksa sayfa açıkça kurulum eksik mesajı gösterir ve kayıt/giriş düğmeleri devre dışı olur.

## 4. Ana site cPanel'de kalacak

bagcali.com'un DNS kaydını Netlify'a taşımayın. Ana sitenin public_html içeriğini değiştirmek gerekmiyor.

`/trade/` için hosting sağlayıcısından yalnızca bu yolu Netlify origin'ine ileten reverse proxy desteği isteyin. Yol `/trade/` olarak korunmalı; auth callback URL'si https://bagcali.com/trade/ olmalı. Assets ve /trade alt yolları da iletilmeli. cPanel .htaccess içinde proxy kuralı desteği her sağlayıcıda yoktur; destek teyidi olmadan kural eklemeyin.

Proxy desteklenmiyorsa trade.bagcali.com alt alan adı alternatiftir. Bu durumda uygulamanın base URL ve Supabase redirect ayarlarını son adrese göre düzenleyin.

Gerçek bot için gereken sabit çıkış IP'si bu web hosting yapılandırmasından ayrıdır. Netlify varsayılan fonksiyonları, standart kurulumda borsaya tanımlanacak tek bir sabit çıkış IP'si sunmaz. Live fazda bot sunucusu/worker ve kontrollü statik egress gerekir.

## Yerel geliştirme

Node 24 ile:

```
npm ci
```

.env.example dosyasını .env olarak kopyalayın, kendi public Supabase bilgilerinizi ekleyin.

```
npm run dev
npm test
npm run build
```

Uygulamanın yolu /trade/ olduğundan geliştirme adresinde bu yolu açın.

## Doğrulama durumu

İşlem simülasyonu ve izin kontrolleri otomatik testlerden geçirildi; üretim derlemesi alındı. Farklı hesaplara erişim olmadığı için gerçek Supabase üyelik akışları, Netlify deploy'u ve bagcali.com proxy bağlantısı henüz doğrulanmadı. Tarayıcıda görsel doğrulama yapılmadı.

Gerçek kullanıcıları davet etmeden önce kayıt, e-posta doğrulama, login, logout, şifre sıfırlama ve başka kullanıcıya ait verilerin erişilememesi kontrollerini tamamlayın. Bu sürüm gerçek API anahtarı veya gerçek emir kabul etmez.
