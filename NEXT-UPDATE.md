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

## 15 Kasım — sesler ve sayaç uyarısı (yerel çalışma)

Düğme/geçiş efektleri, ayrı açılıp kapanabilen süre bitiş zili, ortak ses düzeyi ve sessizken kullanılmayan deneme düğmeleri eklendi. Tercihler çalışma verileriyle kalıcı kaydedilir; eski kayıtlar desteklenir. Çalışma/mola bitiminde erişilebilir görsel uyarı gösterilir. Zil Web Audio üzerinde önceden zamanlanır, duraklatma/sıfırlama/devre dışı bırakmada iptal edilir. Uygulama kapalıyken veya bilgisayar uykudayken ses üretimi garanti edilmez. Fiziksel ses ve küçültülmüş pencere son kontrolü kullanıcı ders çalıştığı için yapılmadı; ekran kontrolü kullanılmadı. Henüz yayımlanmadı.

## 15 Kasım — derslere bağlı hiyerarşik PDF kütüphanesi

Kütüphane kökünde mevcut dersler ve Genel dosyalar bulunur. Aynı Glass Folder animasyonu ders ve alt klasör kartlarında korunur. İstenilen derinlikte alt klasör, konum gezinmesi, seçili konuma PDF yükleme, PDF konumunu değiştirme ve kayıt güvenliği eklendi. Eski klasörsüz PDF’ler ders kökünde korunur; kaldırılmış derslerin dosyalarına da erişilebilir. Derslerim’den Kütüphane kısayolu ilgili ders kökünü açar. State JSON’a isteğe bağlı folders ve folderId alanları eklenmiştir; SQLite tablo yapısı değişmemiştir. Kullanıcının talebiyle ekran kontrolü yapılmadı; henüz yayımlanmadı.

## 15 Kasım — seri takibi, Kıvılcım ve üst alan düzenlemesi

Ayarlar düğmesi Cam görünümü düğmesinin hemen soluna taşındı. Kaydırma davranışı korunarak uygulamanın kaydırma çubukları gizlendi. Her gün toplam en az 30 dakika tamamlanmış odak oturumu seri günü sayılır; mevcut geçmiş de hesaba katılır. Ana panelde son yedi gün, günlük ilerleme, güncel seri ve özgün SVG tilki Kıvılcım gösterilir. Günlük hedef ve yedi günlük eşiklerde tebrik, animasyonları kapatma tercihi, ayarlarda en uzun seri, günlük/oturum rekorları ve toplam süre bulunur. Tebrik tarihi ve animasyon tercihi mevcut SQLite durum kaydıyla korunur; rekorlar kalıcı oturum geçmişinden hesaplanır. Günün hedefi dolmadan önce dünkü seri gün sonuna kadar korunur. Gece yarısını aşan oturum bitiş tarihine yazılır. Tarih sınırları, gün atlama, toplam süre ve bozuk/tekrarlanan kayıtlar otomatik testlerle kontrol edildi. Ekran kontrolü ve sesli deneme yapılmadı; henüz yayımlanmadı.
## 15 Kasım — Kıvılcım’ın kişisel hatırlatmaları

Girişte bugünün tamamlanmamış görevleri saat/konularıyla listelenir. Önceki günlerden kalan işler, en az dört gün çalışılmamış aktif dersler, uzun aradan sonra karşılama ve kesilen seriyi yeniden başlatma önerisi eklendi. Derslere ve görev ayrıntılarına doğrudan geçilebilir. Görev oluşturma/saat değiştirme ve tamamlamalar canlı özete yansır. Tarihi olmayan eski derslerin izlenmesi ilk görülme gününden başlar; yeni veri gerektiren bu süre hakkında kullanıcıya bilgi verilir. Giriş özeti kapatılabilir.

Resmi Tauri notification bileşeni eklendi. Windows bildirimleri varsayılan kapalıdır; yalnızca kullanıcının Ayarlar’dan açıkça seçmesi ve izin kontrolünün geçmesiyle etkinleşir. Günde tek özet ve saatli görevler için başlangıçtan 10 dakika önce/başlangıçtan sonraki ilk 15 dakika içinde tek hatırlatma vardır. Gönderim anahtarı tarih, görev ve saat ile kalıcı tutulur. Aynı anda gelen hatırlatmalar birleştirilir. Arşivlenmiş dersler ve tamamlanan görevler hatırlatma üretmez. Tamamen kapalı uygulama için arka plan servisi kurulmadı; açık/küçültülmüş uygulama gerekir. Bildirimde ders/görev adlarının görünebileceği ayarlarda belirtilir. Hiçbir canlı sistem bildirimi veya sesli test gönderilmedi. Yeni native komut nedeniyle geliştirme sürecinin yeniden başlatılması/yeniden derleme gerekir. Henüz yayımlanmadı.

Teknik kaynak: https://v2.tauri.app/plugin/notification/ — Windows kimliği ve simgesi kurulu paket üzerinde doğrulanmalıdır.
Doğrulama: üretim arayüz derlemesi, 59 uygulama testi, cargo check, 7 masaüstü birim testi ve 3 yayın yapılandırma testi başarılı. Canlı bildirim, ses ve görsel kontrol yapılmadı. İki kaynak kopyasının dosyaları ve bildirim bağımlılığı eşitlendi.

## v0.6.0 yayın hazırlığı — 15 Kasım 2026

Bugünkü sesler, klasörlü kütüphane, seri, Kıvılcım ve bildirim çalışmaları v0.6.0 altında toplandı. İngilizce/Türkçe README ve sürüm geçmişi güncellendi; RELEASE-NOTES-v0.6.0.md eklendi. GitHub iş akışı önce taslak paketi tamamlar; kurulum, imza ve latest.json dosyaları ile sürüm/adres/imza tutarlılığı kontrolünden sonra notlarla birlikte yayımlar. Kontrol başarısızsa taslak yayımlanmaz. Bu son adım için GitHub Actions’ın mevcut contents:write yetkisi kullanılır.

Bu ortamda git push kimlik doğrulama yardımcısı Windows nesne erişim hatasıyla çalışmadı; yayın için kullanıcının kendi PowerShell oturumundan git push --atomic origin main v0.6.0 komutunu çalıştırması gerekebilir. Yayın henüz doğrulanmadı; sürüm yayımlandı iddiasında bulunulmadı.
## 15 Kasım — Takım Alanı geliştirme önizlemesi (yayımlanmadı)

Supabase Auth/PostgreSQL/özel Storage üzerinden çalışan takım alanının kaynakları eklendi. Takım oluşturma, yedi günlük yenilenebilir/iptal edilebilir davet kodu, 20 üyeye kadar katılma, üye çıkarma/ayrılma, ortak UTC çalışma planları ve katılım, iyimser sürüm kontrolü, PDF paylaşma/açma/iki aşamalı silme vardır. Ekran açıkken 30 saniyede yenilenir; çevrimdışı ortak yazma yoktur. Kişisel SQLite verisi ve PDF’ler kendiliğinden paylaşılmaz. Oturumlar ayrı Windows DPAPI dosyasında korunur; parolalar kaydedilmez. İstemciye yalnız publishable/anon public key kabul edilir, service_role/secret reddedilir. Tokenlar webview’e dönmez; sabit Supabase HTTPS hedefi, sınırlı yanıt boyutu, zaman aşımı ve yönlendirmesiz native HTTP kullanılır.

supabase/migrations/202611150001_teams.sql, private bucket ve sunucuda üyelik/rol kontrollerini kurar. scripts/tests/teams-db.check.mjs yerel PostgreSQL üzerinde RLS, RPC, davet yenileme/iptal/son kullanma, yetkisiz tablo yazma, eski plan revizyonu, depoya dosya yükleme kısıtı, üyelik kaldırılınca erişim kaybı ve sunucu sahiplik limitini sınar. Testler gerçek Supabase Auth/SMTP/Storage HTTP uçtan uca sınaması değildir.

Kullanıcı henüz Supabase projesi olmadığını belirtti; kurulum rehberi docs/TEAMS-SETUP.tr.md ve İngilizce karşılığı hazırlandı. İlk iki hesaplı deneme için ek SMTP gerektirmeyen, Dashboard’da oluşturulan onaylı Auth pilot hesaplarıyla parolalı giriş vardır. Herkese açık e-posta OTP için gönderici kurmak gerekir; yerleşik SMTP yalnız kuruluşça yetkili adreslere düşük kotayla gönderir. Arkadaşların Supabase Dashboard yönetimine eklenmesi önerilmez.

Canlı proje kurulmadı, hesap açılmadı, e-posta gönderilmedi, görsel/sesli deneme veya ekran kontrolü yapılmadı. 62 arayüz/helper testi, 9 native birim testi, 12 sunucu kural testi ve üretim derlemesi geçti. İki gerçek hesap ve iki bilgisayarla son kontrol kurulumdan sonra yapılmalı; bu özellik henüz yayınlanmamalı. Kodu mevcut v0.6.0 etiketiyle yeniden etiketleme; sonraki sürüm ancak canlı pilot doğrulandıktan sonra hazırlanmalı.
## 15 Kasım — yerel takvim, maskot ifadeleri ve okul duyuruları (yayımlanmadı)

- Takım/Supabase çalışması kullanıcının talebiyle ertelendi. Kaynakları duruyor; navigasyondan ve native komut kayıtlarından çıkarıldı. Çevrimiçi pilot ayrıca tamamlanmadan yayın kapsamına alınmayacak.
- Kıvılcım: başlangıç, mutlu (1–6 gün), gururlu (7–13 gün), ışıldayan (14+ gün), seri kaybı veya dört günlük arada özleyen/üzgün ifade. İlk kullanımda kayıp seri varsayılmaz; dünün serisi gün sonuna kadar korunur. Hareket azaltma ve animasyon tercihi korunur.
- Planlayıcı: pazartesi başlayan ay/hafta takvimi, ders rengiyle günlük görev notları, seçili gün akışı, tarihten yeni görev, önceki/sonraki dönem ve bugün. Var olan görev ayrıntıları, tamamlama, silme ve saat çakışması kontrolleri korunur. Görev verisi biçimi değiştirilmedi.
- Okul duyuruları: ana panelde en fazla üç HTTPS kaynak; RSS/Atom veya HTML bağlantıları. Kullanıcı eklemeden ağ isteği yok. 12 saat kontrol aralığı, hatada 30 dakika bekleme, çevrimdışı önbellek, elle yenileme ve otomatik kontrolü kapatma. Uygulama açıkken çalışır, tamamen kapalıyken zamanlayıcı yok. Son başarılı liste hatada silinmez; State.schools ile SQLite'da saklanır.
- Native istekler boyut/zaman sınırı ve özel IP engeli uygular; her yönlendirmede DNS cevapları doğrulanıp bağlantıya sabitlenir. Uzak HTML uygulama DOM'una yerleştirilmez; yalnızca metin/HTTPS bağlantı gösterilir. Yeni sunucu veya Supabase gerekmez.
- Uludağ /makine/duyuru için bölüm ana sayfasının Genel Duyurular bölümüne uyarlama eklendi. Resmî sayfanın web görünümünde duyurular doğrulandı; bu makineden doğrudan HTTP istekleri zaman aşımına uğradığından canlı indirme henüz doğrulanmadı. HTML/RSS/Atom ayrıştırması yerel örneklerle test edildi; değişen okul şablonları ek uyarlama gerektirebilir. Şifreli/yalnız JS/UTF-8 dışı sayfalar için destek garanti edilmez.
- Yeni kurulum paketi/etiket/commit/push yapılmadı. Mevcut v0.6.0 etiketi değiştirilmeyecek; yeni yayın öncesinde ayrı sürüm numarası seçilmeli.

## v0.7.0 yayın hazırlığı
Sürüm ve iki dilli yayın notları hazırlandı. Takım alanı çalışma zamanı/navigasyon dışında tutuluyor; kaynakları ilerideki çalışma için korunuyor. Kullanıcı commit/tag/push komutlarını çalıştıracak.
