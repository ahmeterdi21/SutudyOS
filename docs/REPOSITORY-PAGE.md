# GitHub sayfasının son ayarları

README, belgeler, tanıtım görseli ve bildirim formları bu projede hazır. Aşağıdakiler GitHub sayfasının arayüzünden ayarlanır; dosyaları göndermek bunları otomatik değiştirmez.

## About

Depo ana sayfasında sağdaki **About** yanındaki dişliye tıklayın.

**Description** için hazır metin:

```text
Windows için yerel çalışma alanı: çalışma sayacı, ders planlayıcı, PDF kütüphanesi ve ayarlanabilir cam arayüz. Tauri + React + SQLite.
```

**Website:** https://github.com/ahmeterdi21/SutudyOS/releases/latest

**Topics:** `windows`, `tauri`, `react`, `typescript`, `sqlite`, `study-planner`, `productivity`, `local-first`, `glassmorphism`

## Sürüm notları

Yayımlanmış v0.3.0 sürümünün açıklamasına `CHANGELOG.md` içindeki v0.3.0 maddelerini ekleyebilirsiniz. İndirme dosyalarını, imzaları ve `latest.json` dosyasını kaldırmayın.

## Görseller

README'deki `docs/assets/studyos-cover.svg` kişisel veri içermeyen, projeye özel temsili tanıtım görselidir. Gerçek ekran görüntüsü değildir. Daha sonra boş veya örnek kayıtlarla çekilmiş gerçek uygulama görüntüleri eklenebilir.

GitHub'ın sosyal paylaşım önizlemesi ayrı bir ayardır ve PNG/JPEG görsel gerektirir; README'deki SVG bunu otomatik ayarlamaz.

## Lisans

Genel uygulama lisansı henüz seçilmedi; bu düzenlemede sizin adınıza lisans eklenmedi. Yeniden kullanım koşullarını belirlemek isterseniz bunu ayrıca kararlaştırabiliriz. Üçüncü taraf atıfları mevcut dosyada korunur.

## Yayına gönderme

Proje kökünde:

```powershell
git add README.md CHANGELOG.md CONTRIBUTING.md docs .github/ISSUE_TEMPLATE .github/PULL_REQUEST_TEMPLATE.md
git commit -m "Improve repository presentation and user documentation"
git push
```

Bu yalnızca depo belgelerini günceller. Yeni sürüm etiketi gerektirmez ve mevcut yayın iş akışı sadece sürüm etiketlerinde çalıştığından uygulama güncellemesi oluşturmaz.
