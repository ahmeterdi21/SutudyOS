# StudyOS Takım Alanı — ilk kurulum

Bu özellik geliştirme önizlemesidir. Uygulama kodu ve sunucu kurulumu hazırlandı; henüz sizin Supabase projenize kurulmadı. Bu adımlar tamamlanmadan farklı bilgisayarlar birbirini göremez. Bu çalışma bir GitHub sürümü olarak yayımlanmadı.

## Nasıl çalışacak?

Kişisel dersler, geçmiş, seri ve kütüphane mevcut yerel SQLite kaydında kalır. Takım alanı ise Supabase üzerindeki ortak veritabanını ve özel PDF deposunu kullanır. Yalnız seçerek paylaştığınız takım adı, görünen ad, ortak planlar, katılım ve PDF’ler buraya gider. Takım alanına girmek için hesap gerekir; kişisel kullanım için gerekmez.

- Takım oluşturma, kodla katılma, en fazla 20 kişi.
- Yedi gün geçerli davet kodu; yenileme ve iptal etme. Yeni kod eskisini kapatır.
- Ortak saat, konu ve süre planlama; katılacağım seçeneği.
- Saat dilimleri için UTC saklama ve yerel saat gösterimi.
- Oluşturan kişi ve takım sahibi planları düzenleyebilir/silebilir. Eski sürüm üzerine yazma engellenir.
- Ortak PDF yükleme ve görüntüleme; dosya başına 25 MB. Dosyayı yükleyen ve takım sahibi kaldırabilir.
- Üyeden çıkma veya sahibin üye çıkarması; erişim sunucuda kontrol edilir.
- Takım ekranı açıkken yaklaşık 30 saniyede bir yenileme, ayrıca Yenile düğmesi.

Bu ilk sürümde sesli/görüntülü görüşme, mesajlaşma, tam aynı anda başlatılan ortak sayaç, çevrimdışı ortak düzenleme, sahiplik devri ve takımın tamamını silme yoktur. Takım sahibi takımından ayrılamaz; en fazla beş takım oluşturabilir. Liste ekranlarında son 200 plan/dosya gösterilir. Eski verilerin toplu temizliği ve hesap silme için ayrı yönetim akışı hazırlanmalıdır.

## 1. Supabase projesini oluştur

1. [Supabase Dashboard](https://supabase.com/dashboard) adresinde kendi hesabını oluştur/giriş yap.
2. **New project** seç. Örneğin proje adı `studyos-teams` olsun.
3. Kuruluşunda ücretsiz planla başlamayı seç; ücretli plan açman gerekmez. Veritabanı parolasını güvenli bir yerde tut; uygulamaya veya bu sohbete yazma.
4. Sana uygun bölgeyi seç ve proje hazır olana kadar bekle.

15 Kasım 2026 kontrolünde ücretsiz plan 500 MB veritabanı, 1 GB dosya depolama ve kota sınırları içerir; bir haftalık hareketsizlikte proje duraklatılabilir. Paylaşılan PDF’ler toplam depolama ve indirme kotası tüketir. Kullanımı Dashboard’dan takip et. Bu sınırlamalar gelecekte değişebilir. [Güncel fiyatlandırma](https://supabase.com/pricing).

## 2. Veritabanı ve özel dosya deposunu kur

1. Projenin sol menüsünden **SQL Editor → New query** aç.
2. Bu projedeki `supabase/migrations/202611150001_teams.sql` dosyasının tamamını açıp kopyala.
3. SQL Editor’a yapıştır, **Run** düğmesine bas.
4. Hatasız tamamlandığını doğrula. **Table Editor** içinde `study_teams`, `study_team_members`, `study_team_slots`, `study_team_attendance`, `study_team_files` tablolarını görmelisin.
5. **Storage** bölümünde `study-team-files` deposu oluşur. **Public kapalı** kalmalı. Depoyu herkese açık yapma.

Tablolarda üyelik kuralları ve dosya deposunda erişim kuralları SQL ile kurulur. Kuralları kaldırma veya tabloları herkese yazılabilir yapma. Uygulamadaki düğmelerin gizlenmesi erişim denetiminin yerine geçmez.

SQL mevcut StudyOS kişisel SQLite veritabanına dokunmaz. Ayrı/yeni bir Supabase projesinde çalıştırılması önerilir. Yeniden çalıştırma mevcut takım tablolarını silmez.

## 3. Uygulamayı projeye bağla

1. Supabase projesinde **Connect / Project settings → API Keys** üzerinden **Project URL** ve **Publishable key** bilgilerini bul. Eski projelerde `anon public` anahtarı kullanılabilir.
2. URL örneği: `https://projekimligi.supabase.co`.
3. **Secret**, **service_role**, veritabanı parolası, access/refresh token veya SMTP parolası paylaşma. Bunlar uygulamaya girilmez.
4. Geliştirme uygulamasını yeni native kodla yeniden başlat:

```powershell
Set-Location -LiteralPath "C:\Users\User\Documents\Codex\2026-11-08\referenced-chatgpt-conversation-this-is-an\outputs\StudyOS-Yayin"
npm run tauri dev
```

Önceki geliştirme komutu hâlâ çalışıyorsa kendi terminalinde Ctrl+C ile bitirdikten sonra yeniden başlat. Çalışan çalışma sayacını denemek için sıfırlaman gerekmez.

5. Alt menüde **Takım** bölümünü aç. **Yönetici kurulumu** alanına Project URL ve publishable/anon public key yaz; **Takım hizmetini bağla** seç.
6. Bu ilk denemede her iki bilgisayarın da aynı URL/anahtarla aynı projeye bağlanması gerekir.

Bu bilgiler uygulamanın hangi ortak hizmeti kullandığını belirler. Publishable key tek başına takım dosyalarına erişim vermez; giriş ve sunucu üyelik kontrolü ayrıca uygulanır.

## 4A. İlk iki hesaplı deneme — e-posta servisi gerektirmeyen yol

İlk denemeyi parolalı pilot hesaplarla yapabilirsin:

1. Supabase **Authentication → Users → Add user / Create new user** bölümünü aç.
2. Kendin için bir e-posta ve güçlü bir geçici parola belirle; **Auto confirm user** seçeneğini açarak pilot hesabı oluştur.
3. Arkadaşın için ayrı bir Auth kullanıcı hesabı oluştur. Arkadaşın bu hesabın bilgilerini özel kanaldan almalı; parolayı GitHub’a veya bu sohbete yazma.
4. İkiniz de StudyOS **Takım → Parolayla giriş** alanından kendi hesabınızla giriş yapın.
5. Arkadaşını Supabase kuruluşuna veya Dashboard yöneticiliğine eklemen gerekmez. Bu kullanıcılar yalnız uygulama kullanıcılarıdır.

Bu yol kapalı pilot için uygundur. Herkese açık kullanımda doğrulanmış e-posta ve hesap kurtarma/gönderim hizmeti kurulmalıdır. E-posta doğrulamayı proje genelinde kapatmak bu rehberin önerisi değildir.

## 4B. E-posta koduyla giriş — normal kullanıcı akışı

1. **Authentication → Sign In / Providers → Email** etkin olsun. Yeni kullanıcıların kaydolması açık olmalı.
2. **Authentication → Email Templates → Magic Link** şablonunda kodu göster:

```html
<h2>StudyOS giriş kodun</h2>
<p>StudyOS uygulamasına bu kodu yaz: <strong>{{ .Token }}</strong></p>
<p>Bu girişi sen istemediysen bu e-postayı yok sayabilirsin.</p>
```

İlk kayıt e-postası ayrı şablon kullanıyorsa **Confirm signup** şablonuna da aynı kod değişkenini ekle. Uygulama bağlantıya tıklamak yerine e-posta kodunu kullanır.

3. Supabase’in varsayılan göndericisi yalnız proje kuruluşunda yetkilendirilmiş adreslere ve çok düşük kota ile gönderim yapar. Arkadaşlarını sırf bu sınıra takılmamak için Supabase yöneticisi yapma.
4. Gerçek kullanıcılara kod göndermek için **Authentication → Email / SMTP** bölümünde kendi SMTP göndericini yapılandır. Gönderici alan adı doğrulaması, kota ve olası maliyetler sağlayıcına bağlıdır. SMTP parolası yalnız Supabase yönetim panelinde kalır.
5. Uygulamada e-posta ve paylaşım onayını gir, **E-posta kodu gönder** seç; gelen kodla giriş yap. Kodu tekrar istemek için hizmetin bekleme süresine uy.

Kaynaklar: [Supabase OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [SMTP sınırları ve kurulum](https://supabase.com/docs/guides/auth/auth-smtp).

## 5. İki farklı hesapla uçtan uca dene

1. Birinci hesap **Takım oluştur** bölümünden takım ve görünen adını belirlesin.
2. Takım sahibi **Yeni davet kodu oluştur → Kodu kopyala** ile kodu arkadaşına göndersin. Uygulama kendiliğinden kimseye mesaj göndermez.
3. İkinci hesap aynı hizmete bağlanıp **Davetle katıl** alanını kullansın.
4. Birinci hesap ortak çalışma planı oluştursun. İkinci hesap **Yenile** dediğinde veya otomatik yenilemede planı görsün; **Ben de katılacağım** seçsin.
5. Bir PDF paylaş. İkinci hesap PDF’yi açabilsin.
6. Üçüncü, takıma katılmamış bir hesap plan ve PDF’ye erişememeli.
7. Davet kodunu yenile/iptal et. Eski kodla yeni bir kullanıcı katılamamalı.
8. Bir üyeyi çıkar. Eski üye yenilediğinde erişim alamamalı. Daha önce indirdiği kopyalar bilgisayarından geri alınamaz.
9. Aynı planı iki hesapta düzenlemeye başla. Biri kaydettikten sonra diğerinin eski sürümle kaydı hata vermeli; yeni plan sessizce ezilmemeli.
10. Uygulamayı kapat/aç; takım oturumu korunsun. Çıkış yaptıktan sonra kişisel kayıtların durmaya devam etsin.

Bu canlı testler henüz yapılmadı; gerçek proje olmadığı için doğrulama yerel sunucu kuralları ve derleme testleriyle sınırlı. İki hesaplı bu kontrol tamamlanmadan herkese açık sürümü yayımlama.

## 6. Daha sonra herkese dağıtılan sürüme bağla

Kullanıcıların URL/anahtar girmemesi için GitHub **Settings → Secrets and variables → Actions → Variables** içine iki depo değişkeni ekle:

- `STUDYOS_TEAM_URL`: Project URL
- `STUDYOS_TEAM_PUBLIC_KEY`: publishable/anon public key

Sonraki imzalı kurulum hazırlanırken bunlar uygulamaya eklenir. Mevcut kurulu sürüme kendiliğinden eklenmez; yeni derleme gerekir. Bu değerler herkese açık istemci bilgisidir; service_role/secret bu değişkenlere yazılmaz. Yerelde yönetici kurulumu ile başka projeye bağlanılmışsa o bilgisayardaki kayıt önceliklidir.

## Veriler, sınırlar ve bakım

- Hesap erişim ve yenileme anahtarları Windows ile şifrelenen ayrı `teams-session.dpapi` dosyasında tutulur. Kişisel JSON yedeğine, tarayıcı deposuna ve GitHub’a yazılmaz. Parola kalıcı kaydedilmez.
- PDF deposu özeldir; dosya yolu bilinse bile mevcut takım üyeliği gerekir. Üye çıkarma veya ayrılma sonraki sunucu isteklerini keser.
- Başarısız PDF metadata kaydında yüklenen kopya temizlenmeye çalışılır. Temizlik de başarısızsa hata verilir; yöneticinin sahipsiz yüklemeleri Storage’dan incelemesi gerekebilir.
- PDF silme iki aşamalıdır. Kesintide kayıt “Silme tamamlanmayı bekliyor” olarak kalabilir; yükleyen/sahip yeniden silerek tamamlar.
- Kişisel JSON yedeği ortak takım verilerini veya ortak PDF içeriklerini kapsamaz. Takım verisinin yedekleme/geri yüklemesi hizmet yöneticisinin sorumluluğundadır.
- İnternet kesilince eski görünüm korunur ve hata gösterilir; çevrimdışıyken ortak yazma kuyruğu oluşturulmaz.
- Güvenlik testleri yerel PostgreSQL ortamında gerçek roller, RLS ve RPC kurallarıyla çalıştırılır: `npm run test:teams`. Supabase Auth/SMTP/Storage HTTP servislerinin uçtan uca yerine geçmez.

[Üyelik kuralları](https://supabase.com/docs/guides/database/postgres/row-level-security) · [Özel depo erişimi](https://supabase.com/docs/guides/storage/security/access-control).
