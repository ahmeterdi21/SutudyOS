# Görev ayrıntıları ve günlük plan

Bu güncelleme doğrudan `StudyOS-Desktop-v0.1` çalışma klasörüne uygulandı. Yeniden paket indirmek veya npm paketlerini yeniden kurmak gerekmez.

Planlayıcıda **Yeni görev** ile başlık, ders, çalışılacak konu, açıklama, tarih, başlangıç saati ve dakika cinsinden süre girilebilir. Saat isteğe bağlıdır. Girildiğinde bitiş saati hesaplanır; gece yarısını aşan bloklar iki güne ayrılmalıdır. Aynı gündeki tamamlanmamış görevlerde saat çakışması gösterilir; kullanıcı isterse çakışmalı planı kaydedebilir.

Günün akışı tarih seçimine göre saat sırasıyla listelenir. Tüm görevler listesi diğer günlerdeki görevlere erişim sağlar. Görev başlığına tıklamak ayrıntı düzenleyicisini açar. Ana Panel'deki görev başlıkları da aynı düzenleyiciye yönlendirir. Görev silme öncesinde ikinci bir onay gösterilir.

Planlanan görev süreleri gerçek çalışma süresinden ayrıdır. Görevin tamamlandı işaretlenmesi sayaç istatistiği oluşturmaz.

Eski görevler yeni alanlar olmadan geçerlidir. Veritabanı veya kayıtlar sıfırlanmaz; bu güncelleme için şema değişikliği gerekmez.

Doğrulama: TypeScript/Vite üretim derlemesi geçti; 10 test geçti. Bunlardan 5'i eski görev uyumluluğu, bitiş saati, saat çakışmaları, bitişik bloklar ve sıralama içindir. Güncel önizleme sunucusu kapalı olduğundan bu turda yeni ekranın görsel kontrolü yapılamadı.

Denemek için aynı klasörde `npm run tauri dev` çalıştırın. Eski bir görevi açıp konu ve saat ekleyin, kaydedin; yeniden açıldığında ayrıntıların korunduğunu kontrol edin.
