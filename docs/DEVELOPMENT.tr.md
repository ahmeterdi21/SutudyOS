[English](DEVELOPMENT.md) · **Türkçe**

# Kaynaktan çalıştırma

StudyOS; React 19, TypeScript, Tailwind 4 ve Vite arayüzü ile Tauri 2 / Rust masaüstü katmanından oluşur. Kalıcı masaüstü verileri SQLite'ta saklanır.

## Tarayıcı önizlemesi

Node.js 24 ile proje kökünde:

```powershell
npm ci
npm run dev
```

Adres: `http://localhost:1420/`. Tarayıcı verileri localStorage ve IndexedDB kullanır; masaüstü veritabanından ayrıdır. Uygulamanın otomatik güncelleme kontrolü tarayıcıda çalışmaz.

## Windows masaüstü geliştirmesi

[Tauri Windows önkoşullarını](https://v2.tauri.app/start/prerequisites/) kurun: güncel Rust/MSVC araç zinciri, Microsoft C++ Build Tools içindeki C++ masaüstü iş yükü ve Windows SDK, WebView2 ve Node.js. Ardından:

```powershell
npm ci
npm run tauri dev
```

İlk Rust derlemesi paket indirmeleri nedeniyle zaman alabilir. Önizleme ve Tauri geliştirme sunucusunu aynı anda başlatmayın; ikisi 1420 bağlantı noktasını kullanır. Kapatmak için terminalde `Ctrl + C` kullanın.

## Kontroller

```powershell
npm test
node --test scripts/tests/configure-release.check.mjs
npm run build
cargo test --manifest-path src-tauri/Cargo.toml --bin studyos deletion_tests
cargo check --manifest-path src-tauri/Cargo.toml
```

Sayaç, planlama, kayıtların kaldırılması, cam ayarları ve yayın yapılandırması testleri bulunur. WebGL efektleri ve pencere davranışı ayrıca Windows'ta görsel olarak kontrol edilmelidir.

## Yapı

| Konum | Amaç |
|---|---|
| `src/main.tsx` | Uygulama ekranları ve durum yönetimi |
| `src/Planner.tsx` | Günlük akış ve görev ayrıntıları |
| `src/components/` | Cam efektleri, navigasyon ve silme etkileşimleri |
| `src/storage.ts` | Masaüstü/tarayıcı kayıt katmanı |
| `src-tauri/src/` | SQLite ve güncelleme komutları |
| `.github/workflows/release.yml` | İmzalı Windows yayın akışı |

## Yerel kurucu ve yayın

Yerel Windows kurucusu: `npm run tauri build`. Çıktı: `src-tauri/target/release/bundle/nsis/`.

İmzalı güncelleme dağıtımı için [yayın yönergesini](../AUTO-UPDATES.md) izleyin. Özel imza anahtarları veya parolalar depoya eklenmez. Normal katkı, test ve tarayıcı geliştirmesi için yayın anahtarı gerekmez.
