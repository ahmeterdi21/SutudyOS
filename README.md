# StudyOS Desktop · v0.1

Windows için çevrimdışı kişisel çalışma alanı. Tauri 2, React, TypeScript, Tailwind 4 ve Rust / SQLite.

## Hızlı başlangıç

Node.js LTS kurulu bir terminalde bu klasörü açın:

```powershell
npm ci
npm run dev
```

Tarayıcı önizlemesi: http://127.0.0.1:1420 . Önizleme verileri bu tarayıcıya özeldir; masaüstü veritabanıyla paylaşılmaz.

## Windows masaüstü uygulaması

Önce [Tauri Windows önkoşullarını](https://v2.tauri.app/start/prerequisites/) kurun:

1. Microsoft C++ Build Tools: **Desktop development with C++** ve Windows SDK.
2. [Rust](https://rustup.rs/): varsayılan MSVC araç zinciri.
3. Microsoft Edge WebView2 Runtime (Windows 11'de çoğunlukla mevcut).
4. Node.js LTS.

Kurulumdan sonra terminali yeniden açın:

```powershell
npm ci
npm run tauri dev
```

Kurulum paketi oluşturmak için:

```powershell
npm run tauri build
```

NSIS kurulum dosyası `src-tauri/target/release/bundle/nsis/` altında oluşur.

## Kullanım

- Ana Panel: gerçek kayıtlardan günlük hedef, son yedi gün, yaklaşan görevler. Yeni kurulum bilinçli olarak boş başlar; örnek ilerleme gösterilmez.
- Derslerim: ad ve renk ile ders oluşturma.
- Planlayıcı: ders, tarih ve görev ekleme; tamamlandı işaretleme, yeniden açma ve silme.
- Çalışma Odası: 45/90/25 dakika odak, 15/30 dakika mola, 1–240 dakika özel odak süresi. Başlatma, duraklatma ve sıfırlama. Sıfırlama veya farklı süre seçimi mevcut oturumu iptal eder; kısmi süre istatistiğe eklenmez.
- Sayaç her sayfadan erişilebilir. Sistem uykusu ve uygulamanın kapalı kaldığı zaman da geri sayıma dahildir. Süre dolduğunda bir odak kaydı oluşturulur; mola ve sonraki oturum kullanıcı tarafından başlatılır. Bitirme tarihi yerel takvim günüdür; gece yarısında oturum bölünmez.
- Kütüphane: en fazla 25 MB PDF içe aktarma; dosya uygulama depolamasına kopyalanır. İçe aktarılan PDF çalışma odasında seçilen derse bağlanır. PDF görüntüleme, sistem WebView2 PDF desteğine bağlıdır; görüntülenmezse “PDF’yi kaydet” ile açılabilir.
- Ayarlar: koyu/açık cam görünümü ve günlük hedef, PDF içermeyen JSON kayıt dışa aktarımı.

## Kalıcı veri ve yedek

Masaüstünde veriler Tauri `app_data_dir()` altındaki `studyos.sqlite3` içinde saklanır. Windows'ta tipik konum `%APPDATA%\com.studyos.desktop\`. Ayarlar, dersler, görevler, sayaç ve oturumlar sürümlü bir JSON kaydı olarak; PDF içerikleri aynı SQLite veritabanında BLOB olarak tutulur. Sorgular parametrelidir. Kullanıcıdan dosya yolu alınıp okunmaz/yazılmaz.

Tam yedek: uygulamayı kapatın, uygulama veri klasörünün tamamını (varsa `-wal` / `-shm` dosyaları dahil) başka yere kopyalayın. Geri yüklerken uygulama kapalı olmalıdır. JSON dışa aktarımının bu sürümde geri yükleme arayüzü yoktur. SQLite hataları görünür biçimde bildirilir; masaüstünde sessizce tarayıcı depolamasına geçilmez. Dosyalar şifrelenmez.

Tarayıcıda ayarlar localStorage, PDF'ler IndexedDB kullanır. Tarayıcı verilerini silmek önizleme kayıtlarını siler.

## Doğrulama

```powershell
npm test
npm run build
```

Sayaç testleri: zaman sıçraması, yeniden açılma, tek seferlik oturum kaydı, mola hariç tutma, duraklatılmış süre ve yerel gün ataması.

Manuel masaüstü kontrolü: bir ders/görev ekleyin, 1 dakikalık odak başlatın, başka sayfaya geçin, uygulamayı kapatıp yeniden açın. Süre sonunda tek oturum kaydı oluştuğunu doğrulayın. PDF yükleyip özgün dosyayı taşıdıktan sonra yeniden açılabildiğini ve tema/hedefin korunduğunu kontrol edin.

## Kapsam ve sonraki adımlar

Bu ilk prototipte ders adı düzenleme, PDF klasörleme/silme, sınav takvimi, not editörü, bildirim sesi, veri içe aktarma ve otomatik yedek yoktur. Cam etkisi uygulama içindeki CSS yüzeylerindedir; Windows masaüstünü gösteren yerel Acrylic/Mica değildir. Başlangıçta çevrimiçi servis veya hesap gerekmez. Paketleri kurmak ve ilk Rust derlemesi için internet gerekir.

Windows kurulum paketi bu ortamda Rust/Cargo bulunmadığı için doğrulanamamıştır; üretim dağıtımından önce yukarıdaki masaüstü kontrolünü yapın.
