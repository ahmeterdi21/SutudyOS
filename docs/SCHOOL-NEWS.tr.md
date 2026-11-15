# Okul duyuruları — geliştirme önizlemesi

Ana Panel → Okul duyuruların → Okul ekle. Okul/bölüm adını ve herkese açık HTTPS duyuru veya RSS bağlantısını kaydet. En fazla üç kaynak eklenebilir. Her öğrenci kendi kaynağını seçer; bir üniversite varsayılan olarak takip edilmez.

Uludağ için kaynak adresi: https://uludag.edu.tr/makine/duyuru

Bu sitenin arşiv tablosu sonradan yüklenir; okuyucu bölüm ana sayfasındaki Genel Duyurular bölümünü kullanır. Canlı bağlantı bu çalışma ortamında zaman aşımına uğradı; uygulama üzerinden son kontrol yapılmalı. Resmî sayfa: https://uludag.edu.tr/makine

Başlıklar ve bağlantılar yerel kaydedilir; duyurunun tam içeriği kaynak site düğmesiyle varsayılan tarayıcıda açılır. HTML bağlantı listeleri otomatik yorumlanır; resmî başlık/tarih/ek dosya için kaynak site esas alınır. Sayfaların içinde gelen talimatlar çalıştırılmaz, hesap girişleri yapılmaz.

Uygulama açıkken/yeniden öne geldiğinde son kontrolden 12 saat geçmişse güncellenir. Bir hata olursa önceki liste korunur; otomatik yeniden deneme en erken 30 dakika sonradır. İnternet gerekli değildir; yalnızca duyuru yenileme internet ister. Kaynağı kaldırmak yalnızca StudyOS içindeki kayıt ve önbelleği kaldırır, okul sitesini değiştirmez.

RSS/Atom önceliklidir. Giriş isteyen, tamamen JavaScript ile oluşturulan, eski metin kodlaması kullanan veya otomatik erişimi engelleyen siteler için uyarlama gerekebilir. Her okul sitesinin çalışacağı garantisi yoktur. Uygulama tamamen kapalıyken arka plan servisi çalışmaz.

## Yayın öncesi elle kontrol

- Kendi okul adresini kaydet; yeni listeyi resmî sayfayla karşılaştır.
- Uygulamayı yeniden aç; kaynaklar ve liste korunmalı.
- İnternet kapalıyken eski duyurular ve kişisel dersler/takvim kullanılabilmeli.
- Takvimde bir güne görev ekle, düzenle, tamamla ve sil; ay/hafta geçişini dene.
- Koyu/açık tema, farklı pencere genişlikleri ve azaltılmış hareket tercihini incele.

Bu kontroller otomatik testlerin yerine geçmez; canlı okul erişimi ve görsel kullanıcı kontrolü tamamlanmadan paket yayımlanmamıştır.
