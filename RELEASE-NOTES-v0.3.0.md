# StudyOS v0.3.0 — Cam çalışma alanı

- İçerik alanı ve kartlar ayarlanabilir cam yüzeylere dönüştürüldü. Bulanıklık, yoğunluk, doygunluk, renk ve kenar parıltısı ayarlanıp kaydedilebilir. Üç yerel arka plan paleti eklendi.
- Mevcut animasyonlu alt navigasyon korundu; ikinci navigasyon eklenmedi.
- Logo sol üst üst çubuğa taşındı; açılış animasyonu oraya yönlenir. Reveal motorunun opak canvas arka planı şeffaf kompozitle değiştirildi.
- Görev, ders ve PDF'lere iki saniye basılı tutarak silme eklendi. Kısa tıklama normal onay penceresi açar.
- Ders kaldırma bağlı kayıtları korur. PDF içeriği ve kütüphane kaydı birlikte silinir; yazma hatasında geri alınır.
- Geliştirme sırasında aynı uygulama kökünün tekrar oluşturulması ve küçültülmüş pencerede geçersiz logo ölçeği üretimi düzeltildi.
- Uygulama kimliği, veriler ve imza anahtarı korundu.

## Kontroller

Üretim arayüz derlemesi ve Windows Rust kod kontrolü başarılı. 24 uygulama testi, 3 yayın testi ve 2 Rust/SQLite testi geçti (29 test). Çalışan Windows geliştirme penceresinde cam dashboard, sol üst logo, alt navigasyon, cam ayarları ve yeniden yükleme kontrol edildi. Paketlenmiş v0.2.1 → v0.3.0 güncellemesi yayın sonrası ayrıca denenmelidir.

## Yayın

StudyOS-Yayin klasöründe aşağıdaki komutları tek tek çalıştırın:

```powershell
git add .
git commit -m "StudyOS v0.3.0: glass workspace and interaction improvements"
git push
git tag v0.3.0
git push origin v0.3.0
```

Her adım başarılı olduktan sonra sonrakine geçin. Etiket zaten varsa üzerine yazmayın.

GitHub Actions taslak Release hazırlar. Testten sonra taslağı yayımlayın. Eski kurulu uygulamada Kontrol et → Güncelle ile sürümü alın. Önce sayacı duraklatın; kurulum sonrası sürüm numarası ve kayıtları kontrol edin.

Bu oturumda GitHub bağlantısı sağlanamadığı için commit, push, tag ve yayın yapılmadı.
