# Birleşik tasarım önizlemesi — yayımlanmadı

Çalışma klasörü: `StudyOS-Yayin`. Kurulu sürüm değiştirilmedi. GitHub'a commit, push, tag veya Release gönderilmedi. Sürüm bu tasarım turunda v0.3.0 olarak tutuldu; bugün eklenecek diğer özellikler aynı yayın içinde toplanabilir.

## Eklenen üç bileşen

1. **React Bits HoldButton:** Planlayıcıdaki görev satırlarında ve ayrıntılarında, ders kartlarında ve PDF satırlarında görünür silme eylemi. İki saniye basılı tutmak silmeyi başlatır. Erken bırakma/Escape/odak kaybı iptal eder. Kısa tıklama veya yardımcı teknolojiyle etkinleştirme normal onay penceresi açar. Kaydetme başarısızsa öğe görünür kalır ve hata gösterilir.
2. **Liquid Glass logo reveal:** Kullanıcının sağladığı WebGL2 motoru kendi StudyOS logomuzu camdan açığa çıkarır. Açılış, mevcut kısa güncelleme kontrolünü korur; bitişte logo yeni alt navigasyondaki yerine gider. Görüntü motoru başarısızsa veya hareket azaltma açıksa statik logo kullanılır.
3. **Nimbus Waterline alt navigasyon:** Sol menü kaldırıldı. Yedi bölüm alt ortada yüzen cam menüye taşındı; arkasında ekran genişliğinde bir şerit yok. Dar pencerelerde erişilebilir isimler korunarak simge düzenine geçilir. Sayaç ayrı bir küçük panel olarak menünün üstünde kalır. Menü sesi kapalıdır.

## Kayıt davranışı

- Görev, tamamlandı işaretlenmeden de silinebilir.
- Ders kaldırıldığında listeden gizlenir; bağlı görevler, PDF'ler ve geçmiş için ad/kayıt korunur. Bağlı görev başka derse atanabilir. O derste sayaç çalışıyorsa önce duraklatılması gerekir.
- PDF silme uygulamanın kopyasını kaldırır; özgün dosyaya dokunmaz. Masaüstünde PDF içeriği ve güncel kütüphane kaydı aynı SQLite işlemiyle değiştirilir. Kayıt hatasında işlem geri alınır.

## Doğrulama

- TypeScript/Vite üretim derlemesi başarılı.
- 21 uygulama testi ve 3 yayın yapılandırma testi başarılı.
- Rust Windows `cargo check --offline` başarılı.
- 2 Rust testi: PDF/metadata birlikte silme ve yazma hatasında PDF/metadata geri alma başarılı.
- Bu oturumda çalışan geliştirme penceresi bulunmadığı için WebGL efektlerinin ve basılı tutma etkileşiminin görsel uçtan uca kontrolü tamamlanamadı. Derleme başarısı görsel doğrulamanın yerine geçmez.

## Yerel deneme

Bu klasörde terminal açın:

```powershell
npm run tauri dev
```

Tarayıcı önizlemesi için `npm run dev` ve `http://localhost:1420/`. İkisini aynı anda başlatmayın. Önceden çevrimdışı Cargo ayarı kullandıysanız gerekli paketler artık indirilmiş olduğundan bu ayar isteğe bağlıdır.

Önce geçici bir ders/görev/PDF ile deneyin: erken bırakma, iki saniye tutma, kısa tıklama onayı, Vazgeç, yeniden açıldıktan sonra kayıt kontrolü. Günlük kullandığınız kayıtlar yerine bu deneme öğelerini kaldırın. Açık/koyu görünüm, 900 px ve 1440 px pencereler, hareket azaltma ve grafik desteği olmayan durumda yedek görünüm de kontrol edilmelidir.
