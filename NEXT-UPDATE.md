# Güncelleme durumu

## v0.4.0 — geliştirme önizlemesi

Kullanıcının 8 Kasım 2026 başlama talimatıyla pencere ve simge değişiklikleri uygulandı. Henüz yayımlanmadı.

- Mavi yerel başlık çubuğu yerine cam tasarıma uyumlu özel üst çubuk.
- Açılışta büyütülmüş pencere; Windows görev çubuğu korunur.
- Küçültme, büyütme/geri yükleme ve kaydetmeyi bekleyen kapatma kontrolleri.
- Mevcut alt navigasyon, dashboard ve sol üst logo korunur.
- Yeni geometrik logo, çalıştırılabilir dosya, çalışma zamanı pencere simgesi ve kurulum/kaldırma simgelerine açıkça bağlandı.

## Yayın öncesi kalan kullanıcı kontrolü

- Geliştirme penceresinde sürükleme, çift tıklama, küçültme/geri yükleme ve farklı ekran ölçeklerini deneme.
- Son tasarım geri bildirimlerini alma; sonra GitHub Actions üzerinden imzalı paket oluşturma.
- Kurulu sürüm güncellendikten sonra Başlat menüsü ve sabitlenmiş görev çubuğu kısayolunu doğrulama. Windows eski kısayol simgesini önbellekte tutabilir; önbellek veya kullanıcı verileri silinmedi.

## Önceki yayın

Kullanıcı v0.3.0 GitHub Actions yayınının ve uygulama içi güncellemenin başarılı olduğunu doğruladı.

## Asistan — geliştirme sürümüne eklendi

ChatGPT bağlantısı ve kişisel Gemini anahtarı alternatifi, plan önerisi, düzenleme ve onayla planlayıcıya kayıt eklendi. Kullanıcının ilk canlı hesap bağlantısını ve plan üretimini denemesi gerekiyor. Ayrıntılar: docs/AI-SETUP.tr.md.

## Acil düzeltme v0.4.1

Kapatma için eksik core:window:allow-destroy izni eklendi. Kayıt sonrası doğrudan destroy çağrısıyla ikinci kapatma olayı kaldırıldı. Yayın etiketi v0.4.1 olmalıdır.

## 9 Kasım — henüz yayımlanmayacak tasarım çalışması

Derslerim bölümü, kullanıcının gönderdiği Glass Folder Cards kaynağıyla yeniden tasarlandı. Ders rengine bağlı yerel desen, açık/koyu cam klasör, açılma animasyonu, gerçek bekleyen görev ve PDF bağlantıları, tam içerik listesi, mevcut odaklanma ve silme onayı korundu. Klasörden görev ayrıntısına geçiş geliştirme penceresinde doğrulandı. Derleme ve 35 uygulama testi başarılı. Bu değişiklik yayımlanmadı; kullanıcının diğer fikirleriyle birleştirilecek.

## v0.5.0 — bugünkü toplu geliştirme hazır

Cam ders klasörleri, Animated AI Chat tasarımından uyarlanan gerçek genel metin sohbeti ve sağ üst Ayarlar kısayolu eklendi. Plan üretimi ayrı mod olarak korundu. Sohbet oturum belleğinde tutulur; 19 mesaja ve byte bütçesine göre yakın bağlam gönderilir. Yeni ai_chat komutu Windows sürümüne derlenmelidir; eski kurulu paket bu komutu içermez. Canlı mesaj sınaması kullanıcı hesabıyla yapılacak. Kullanıcı incelemesi öncesi commit/push/etiket/yayın yapılmadı.
