# StudyOS Asistan — geliştirme önizlemesi

Windows masaüstü uygulamasının alt menüsündeki Asistan bölümünü aç.

## ChatGPT ile

1. ChatGPT hesabım → Continue with ChatGPT.
2. Resmî OpenAI sayfasında hesabını ve çalışma alanını seç; StudyOS için plan kullanımına izin ver.
3. Uygulamaya dönüp Modelleri getir düğmesine bas ve bir model seç.
4. Konu, hedef, başlangıç tarihi, gün sayısı ve günlük süreyi gir.
5. Gönderilecek bilgileri inceleyip onay kutusunu işaretle; Plan öner düğmesine bas.
6. Önerileri düzenle, istediğin görevleri seç ve planlayıcıya ekle.

Uygun ChatGPT planı, çalışma alanı politikaları ve kota gerekir. Kota diğer uygulamalardaki kullanımla paylaşılabilir. Model listesi hesabından alınır. Giriş üç dakika içinde tamamlanmazsa yeniden başlat.

Bağlantıyı kaldır, bu bilgisayardaki kaydı kaldırır. OpenAI tarafındaki izni ve kotayı Kullanım ve izinler düğmesinden yönet. Başka hesaba geçmeden önce mevcut bağlantıyı kaldır.

## Gemini — ücretsiz kota alternatifi

Gemini sekmesinden Google AI Studio bağlantısını açıp kendi anahtarını oluştur. Ücretsiz katmandaki, faturalandırması kapalı projenin koşullarını ve kotasını kontrol et. Anahtarını yalnız uygulamadaki parola alanına gir; sohbet veya GitHub üzerinden paylaşma.

Gemini 3.5 Flash-Lite kullanılır. Anahtar kaydı geçerliliğini kanıtlamaz; ilk plan isteği gerçek bağlantıyı sınar. Ücretsiz kota bölgeye, hesaba ve güncel hizmet koşullarına bağlıdır. StudyOS proje faturalandırmasını doğrulayamaz; faturalandırması açık projeler ücret doğurabilir. Google ücretsiz katmanda gönderilen içeriği ürün geliştirmek için kullanabilir. Otomatik sağlayıcı geçişi veya ücretli yükseltme yapılmaz.

## Paylaşım ve kayıt

Yalnız gösterilen konu, hedef, tarih, gün sayısı ve günlük süre seçilen sağlayıcıya gönderilir. PDF, mevcut görevler ve çalışma geçmişi gönderilmez. Öneriler otomatik eklenmez. Yarım kalan, günlük süreyi veya tarih aralığını aşan yanıtlar reddedilir. Görevlerin saatlerini daha sonra planlayıcıda belirle.

Kimlik bilgileri uygulama veri klasöründeki `ai-credentials.dpapi` dosyasında Windows hesabına bağlı DPAPI ile korunur. Çalışma veritabanına, tarayıcı depolamasına veya JSON dışa aktarımına yazılmaz. Farklı Windows hesabına taşınan bağlantı dosyası açılamayabilir; yeniden bağlan.

Derleme ve yerel testler gerçek hesap izninin veya kotanın varlığını kanıtlamaz. İlk canlı giriş ve plan üretimi kullanıcı tarafından tamamlanmalıdır.

Resmî belgeler: [ChatGPT giriş akışı](https://developers.openai.com/siwc/token-sharing-open-source/sign-in), [model ve istek kuralları](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference), [Gemini ücret ve kota bilgileri](https://ai.google.dev/gemini-api/docs/pricing).
