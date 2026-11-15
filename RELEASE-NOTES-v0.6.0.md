# StudyOS v0.6.0

## v0.6.0 — 15 Kasım 2026

- Ayarlardan yönetilen düğme/geçiş sesleri, ayrı süre bitiş zili, ses düzeyi ve görünür çalışma/mola bitiş uyarısı.
- Derslere bağlı PDF kütüphanesi; animasyonlu cam kartlar, alt klasörler, konum gezinmesi ve PDF konumunu değiştirme.
- Günde en az 30 dakika tamamlanmış odak çalışmasıyla seri; son yedi gün ve kişisel çalışma rekorları.
- Animasyonlu tilki Kıvılcım: bugünkü görevler, dört gündür çalışılmayan dersler, uzun aradan sonra karşılama ve seri hatırlatmaları.
- İzinle açılan Windows bildirimleri: günlük özet, saatli görev hatırlatmaları ve tekrarları önleyen kalıcı gönderim kaydı.
- Ayarlar, Cam görünümü düğmesinin hemen soluna taşındı. Kaydırma korunarak çubuklar gizlendi.

Mevcut görevler, tamamlanmış oturumlar ve PDF’ler korunur. Bildirimler için uygulamanın açık veya küçültülmüş olması gerekir; tamamen kapalıyken çalışmaz.

### Kullanım

- Sesler ve Kıvılcım tercihleri Ayarlar’da bulunur. Windows bildirimleri varsayılan kapalıdır; kullanıcı etkinleştirip izin verir.
- Saatli görev bildirimi başlangıçtan 10 dakika önce hazırlanır; gecikmeli kontrol başlangıçtan sonraki ilk 15 dakikada yakalar.
- Günlük seri, tamamlanmış odak oturumlarını toplar; molalar sayılmaz. Önceki çalışma geçmişi de hesaba katılır.
- Çalışma kaydı olmayan derslerde dört günlük hatırlatma süresi bu özelliğin dersi ilk gördüğü tarihten başlar.
- Yeni kurulum için Assets içindeki StudyOS_0.6.0_x64-setup.exe dosyasını kullanın. Mevcut kullanıcılar uygulamadan güncellemeyi kontrol edebilir.

### Doğrulama

Üretim derlemesi, 59 uygulama testi, 7 masaüstü birim testi ve 9 yayın yapılandırma testi geçti. Canlı ses/bildirim ve görsel son kontrol bu çalışma sırasında yapılmadı.

---

## v0.6.0 — November 15, 2026

- Optional button/navigation sounds, separate timer-end alarm and volume controls; visible focus/break completion notices.
- Lesson-based PDF library with nested folders, animated glass cards, breadcrumbs and document moves between folders.
- Daily streaks for at least 30 minutes of completed focus sessions, seven-day progress and personal records.
- Kıvılcım, an animated fox companion with today’s tasks, inactive-lesson reminders and encouraging streak messages.
- Opt-in Windows notifications: one daily digest and timed task reminders; saved delivery tracking prevents routine repeats.
- Settings now sits immediately left of the glass appearance control. Scrollbars are hidden while scrolling stays available.

Existing tasks, completed sessions and imported PDFs are preserved. Notifications require the app to be running (including minimized); they do not run after the app closes. The interface remains in Turkish.

### Usage

- Configure sounds and Kıvılcım in Settings. Windows notifications start disabled and require explicit opt-in and a permission check.
- Timed reminders start 10 minutes before a task; late checks catch tasks up to 15 minutes after their start time.
- Streaks use completed focus sessions, including your existing history; breaks do not count.
- For subjects without recorded study activity, inactivity tracking starts when this feature first sees the subject.
- Download StudyOS_0.6.0_x64-setup.exe from Assets, or check for updates in an existing installation.

### Validation

Production build, 59 application tests, 7 desktop unit tests and 9 release-configuration tests passed. Live sound/notification delivery and visual checks were not performed during this work.
