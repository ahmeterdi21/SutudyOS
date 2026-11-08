# Birlikte hazırlanacak tasarım güncellemesi

Durum: Kullanıcı yeni örnekler paylaşmaya devam ediyor. Bu listedeki bileşenler henüz uygulamaya entegre edilmedi; kaynak toplama aşamasındayız. Toplu entegrasyon ve tek güncelleme hedefleniyor. Mevcut v0.3.0 logo/açılış çalışması bu kapsamla birlikte değerlendirilecek. Henüz yeni yayın yapılmayacak.

## 1. Basılı tutarak silme — React Bits HoldButton

Kullanıcı tarafından JavaScript ve CSS kaynakları sağlandı. İki saniyelik basılı tutma, ilerleyen dolgu, erken bırakınca iptal, klavye/dokunmatik desteği ve Türkçe etiketler hedefleniyor.

Uygulanacak yerler: görevler, dersler ve PDF kütüphanesi. Görevlerin silinmesi tamamlandı durumuna bağlı olmayacak. Ders silme işleminin bağlı görev/PDF/geçmiş üzerindeki etkisi entegrasyonda açıkça tasarlanacak; bağlı kayıtlar sessizce silinmeyecek. Paylaşılan bileşenin odak kaybı, devre dışı bırakılma ve asenkron kayıt hatalarındaki davranışı ayrıca gözden geçirilecek.

## 2. Liquid Glass logo reveal — 21st.dev

Kaynak: https://21st.dev/r/shepovalovdenis/liquid-glass-logo-reveal

Kullanıcının paylaştığı kurulum komutu (henüz çalıştırılmadı):

```text
npx shadcn@latest add "https://21st.dev/r/shepovalovdenis/liquid-glass-logo-reveal"
```

Kullanıcı hem entegrasyon metnini hem TypeScript kaynak kodunu sağladı. Kod; WebGL2 tabanlı cam kırılması/renk ayrışması, SVG veya görselden logo yükleme, açık/koyu ayarlar ve WebGL kullanılamadığında yedek gösterim içeriyor. Kaynak yorumunda motorun `zanwei/glass-icon-reveal` projesinden MIT lisansıyla uyarlandığı belirtiliyor; entegrasyonda asıl lisans ve atıf metinleri kontrol edilip korunacak.

Varsayılan örnek `GlassReveal21st`, 21st.dev markasını kullanıyor. StudyOS entegrasyonunda alttaki `GlassIconReveal` motoru kendi geometrik logomuzla kullanılacak. Örnek marka StudyOS logosunun yerine geçirilmeyecek.

Hedef akış: StudyOS logosu cam etkisiyle görünür → aynı anda güncelleme kontrolü → logo sol menüdeki yerine geçer → ana ekran açılır. Mevcut yaklaşık 3–5 saniyelik açılışa uyum için efekt zamanlaması ayarlanacak; örnek uzun/döngülü animasyon varsayılanları doğrudan kullanılmayacak.

Entegrasyon kontrolleri: yerel logo ile çevrimdışı çalışma, Windows WebView2/WebGL2 desteği, WebGL yokken statik logo, azaltılmış hareket, GPU kaynaklarının kapanışta serbest bırakılması, açık/koyu tema uyumu. Bu motor açılış logosu içindir; uygulamanın tüm kartlarına otomatik olarak Liquid Glass uygulamaz.

## 3. Genel Liquid Glass tasarımı

Menü/kart/düğmeler için okunabilirliği koruyan tutarlı cam yüzeyler isteniyor. Ayrıntılar ve diğer referanslar kullanıcı tarafından paylaşılacak; henüz kapsamı netleşmedi.
