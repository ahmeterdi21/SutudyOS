# StudyOS kurulumu ve ilk kullanım

## Windows'a kurulum

1. [En güncel sürümü açın](https://github.com/ahmeterdi21/SutudyOS/releases/latest).
2. **Assets** bölümünde adı `x64-setup.exe` ile biten StudyOS kurucusunu indirin.
3. Kurucuyu çalıştırıp yönergeleri izleyin. Açık bir StudyOS penceresi varsa önce kapatın.
4. StudyOS'u Başlat menüsünden veya kısayoldan açın.

`.sig`, `latest.json` ve **Source code** dosyaları normal kurulum için gerekli değildir. Uygulamayı kullanmak için Node.js, Rust veya bir GitHub hesabı kurmanız gerekmez. Kaynaktan geliştirmek isteyenler için [geliştirme rehberi](DEVELOPMENT.md) ayrıdır.

Windows x64 için paket hazırlanır. Uygulama Microsoft Edge WebView2 kullanır. Uygulama açılmıyorsa hata mesajıyla birlikte [sorun bildirin](https://github.com/ahmeterdi21/SutudyOS/issues/new/choose). Windows güvenlik bildirimi görülürse kaynağı ve indirdiğiniz dosyayı kontrol edin; güncelleme imzası, Windows kod imzalama sertifikasıyla aynı şey değildir.

## İlk beş dakika

1. **Derslerim:** Kendi dersinizi veya çalışma alanınızı ekleyin; örneğin Matematik, Yabancı Dil veya Kitap Okuma.
2. **Planlayıcı:** Tarih, konu, başlangıç saati ve süreyle ilk görevinizi oluşturun.
3. **Çalışma Odası:** Dersi seçin, bir odak süresi belirleyip sayacı başlatın.
4. **Kütüphane:** PDF notlarınızı uygulamaya kopyalayın. Dosya başına sınır 25 MB'dır.
5. **Cam görünümü:** Üst çubuktan kendi görünümünüzü ayarlayın. Açık/koyu tema da kullanılabilir.

Yeni kurulum boş başlar. Grafiklerde ilerleme görmeniz için odak oturumlarını tamamlamanız gerekir. Planladığınız süre, gerçek çalışma süresinden ayrıdır. Görevi tamamlandı işaretlemek otomatik olarak bir sayaç oturumu oluşturmaz.

## Silme ve kayıtlar

Görev, ders ve PDF düğmelerini iki saniye basılı tutarak kaldırabilirsiniz. Kısa tıklama normal onay penceresi açar. Ders kaldırıldığında ona bağlı görevler, dosyalar ve geçmiş korunur. PDF kaldırma yalnızca uygulamadaki kopyayı etkiler; içe aktardığınız özgün dosyaya dokunmaz.

Sayaç sayfa değişikliklerinde ve yeniden açıldığında durumunu korur. Sistem uykusu ve uygulamanın kapalı kaldığı zaman geri sayıma dahildir. Yalnızca tamamlanan odak oturumları istatistiklere eklenir; sıfırlanan kısmi süreler eklenmez.

## Güncelleme

Uygulama açılışta yayımlanmış yeni sürümü kontrol eder. Güncelleme varsa **Güncelle** düğmesini kullanın. Çalışan sayacı önce duraklatın. **Ayarlar → Kontrol et** ile elle de kontrol edebilirsiniz.

İnternet bağlantısı olmadan temel çalışma özellikleri kullanılabilir; güncelleme kontrolü ve indirme için bağlantı gerekir. Güncellemeler GitHub Releases üzerinden dağıtılır ve imzaları doğrulanır. GitHub'daki taslak sürümler güncelleme olarak görünmez.

## Yedekleme

Masaüstü verileri ve içe aktarılan PDF'ler tipik olarak `%APPDATA%\com.studyos.desktop\` klasöründeki SQLite veritabanında bulunur.

Tam yedek için uygulamayı kapatın ve bu klasörün tamamını güvenli bir yere kopyalayın. Geri yükleme de uygulama kapalıyken yapılmalıdır. Ayarlar'daki JSON dışa aktarımı PDF'leri içermez ve bu sürümde JSON içe aktarma arayüzü yoktur. Veritabanı şifrelenmez.
