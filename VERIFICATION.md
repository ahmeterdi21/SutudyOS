# Doğrulama · 8 Kasım 2026

- `npm run build`: TypeScript ve Vite üretim derlemesi başarılı.
- `npm test`: 5 sayaç testi başarılı.
- Paket güncellemesi sonrasında npm denetimi: 0 açık bildirildi.
- Tarayıcıda: ders ekleme, ders bağlantılı görev ekleme, sayfa geçişi, sayaç başlatma/duraklatma, yeniden yüklemede sayaç ve kayıtların korunması, açık/koyu tema test edildi.
- 1440×960 masaüstü düzeni ve dar önizleme düzeni görsel olarak kontrol edildi.
- `npm run tauri icon app-icon.svg`: uygulama simgeleri oluşturuldu.
- `tauri info`: WebView2 mevcut. Rust, Cargo ve MSVC/SDK araçları eksik. Windows çalıştırılabilir dosyası/NSIS paketi oluşturulamadı.

Bu ortamda yerel SQLite komutları, WebView2 içindeki PDF görüntüleyici ve Windows kurulum paketi çalışma zamanında test edilmedi. Tarayıcıdaki başarı, bu yerel bileşenlerin doğrulandığı anlamına gelmez. PDF yükleme/kopyalama kodu mevcut; uçtan uca dosya testi ayrıca yapılmalı.

Ekran görüntüsünde görülen Matematik dersi ve görev yalnızca tarayıcı kontrolü sırasında eklenmiştir. Kaynak proje yeni kurulumlarda boş veriyle başlar.
