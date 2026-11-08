# GitHub Releases ile güncelleme

Uygulama tarafı ve Windows yayın iş akışı hazırlandı. Güncelleme deposu `ahmeterdi21/SutudyOS` olarak ayarlandı. İmza anahtarları henüz bağlanmadığı için otomatik güncelleme etkin değildir. Hiçbir dosya GitHub'a gönderilmedi.

Depo: https://github.com/ahmeterdi21/SutudyOS

Yayımlanmış sürüm bilgisi: https://github.com/ahmeterdi21/SutudyOS/releases/latest/download/latest.json

GitHub ayarları: https://github.com/ahmeterdi21/SutudyOS/settings/secrets/actions

GitHub değişkenleri: https://github.com/ahmeterdi21/SutudyOS/settings/variables/actions

## Nasıl çalışır?

Kurulu sürüm açılışta GitHub Releases üzerindeki `latest.json` dosyasını kontrol eder. Daha yeni sürüm varsa **Güncelle** düğmesi görünür. Sayaç çalışıyorsa önce duraklatılır. Kurulum öncesinde kayıt kuyruğu beklenir ve güncel durum kaydedilir. Güncelleme resmi Tauri updater tarafından indirilir ve imzası doğrulanır. Windows kurucusu uygulamayı kapatabilir; kurulum sonrası yeniden açılır. Açılmazsa masaüstü kısayolundan açılabilir. Veri klasörünün kimliği `com.studyos.desktop` olarak korunur; güncelleme kodu veritabanını silmez.

Otomatik olan kontrol ve indirmeye erişimdir; kurulum kullanıcı tarafından başlatılır. Tauri geliştirme çalışmasında (`npm run tauri dev`) ağdan güncelleme yapılmaz. Tarayıcı önizlemesinde güncelleme paneli yoktur.

## Bir defalık hazırlık

Bu proje klasörünü depo kökü olacak şekilde GitHub'a yüklemek gerekir. Basit yapılandırma, herkese açık bir GitHub deposundaki Releases dosyalarını kullanır. Depo görünürlüğünü değiştirmeden önce karar verilmelidir; özel depo için ayrıca kimlik doğrulama veya ayrı bir herkese açık dağıtım deposu gerekir. Kişisel SQLite dosyaları ve PDF'ler projeye dahil edilmemelidir.

1. Proje klasöründe, yayın imza anahtarını üretin:

```powershell
npm run tauri signer generate -- -w "$env:USERPROFILE\Documents\studyos-updater.key"
```

Parolayı ve özel anahtarı güvenli bir yerde saklayın. Özel anahtarı bu sohbete, kaynak koduna veya normal GitHub dosyasına eklemeyin. Bu dosya uygulamayı güncelleme yetkisini temsil eder. Kaybedilirse eski kurulumlara aynı anahtarla güncelleme gönderilemez. İmza Windows Authenticode sertifikası değildir; Windows ayrıca güvenlik bildirimi gösterebilir.

2. GitHub deposunda Settings → Secrets and variables → Actions bölümüne ekleyin:

| Tür | Ad | İçerik |
|---|---|---|
| Variable | `STUDYOS_UPDATE_PUBLIC_KEY` | `.key.pub` dosyasının tamamı |
| Secret | `TAURI_SIGNING_PRIVATE_KEY` | `.key` dosyasının tamamı |
| Secret | `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Anahtar oluşturulurken seçilen parola |

3. `package.json`, `src-tauri/Cargo.toml` ve `src-tauri/tauri.conf.json` sürümleri birlikte artırılır. `package-lock.json` kök sürümleri de eşleştirilir. İlk güncellemeli sürüm `0.2.0` olarak hazırlandı.
4. Proje GitHub'a gönderildikten sonra eşleşen `v0.2.0` etiketi gönderilir. İş akışı Windows paketini, imzayı ve `latest.json` dosyasını bir **taslak Release** içine hazırlar. Testten sonra GitHub'da taslak yayımlanır. Yayımlanmış yeni sürümler kurulu uygulamanın kontrolünde görünür.
5. Eski v0.1 kurulumunda güncelleme kodu yoktur. Bu nedenle ilk v0.2 kurucusu **bir defa elle** çalıştırılmalıdır. Önceki kurulumu kaldırmak veya veri klasörünü silmek gerekmez.

## Şu anda kurulu eski sürümü güncellemek

En güncel kaynaklardan yerel kurucu üretilebilir:

```powershell
npm run tauri build
```

Sonra `src-tauri\target\release\bundle\nsis` içindeki yeni kurucuyu çalıştırın. Henüz GitHub bağlantısı girilmemişse bu paket otomatik güncelleme kanalını etkinleştirmez. Depo ve imza bağlantısı tamamlandıktan sonra GitHub'ın ürettiği kurucuyu kullanmak gerekir.

## Yayın öncesi zorunlu kontrol

Önce uygulama kapalıyken veri klasörünün yedeğini alın. İmzalı ilk sürümü kurun, bir ders/görev ekleyin. Daha yüksek sürümlü ikinci bir test yayını oluşturun. İlk sürümün güncellemeyi görmesini, kurulumun tamamlanmasını, sürüm numarasının değişmesini ve kayıtların korunmasını kontrol edin. Ağ kapalıyken uygulama çalışmaya devam etmeli; kontrol hatası görünür olmalıdır. İmzası uyuşmayan paket kurulmamalıdır.

Bu uçtan uca kontrol ve GitHub yayını henüz yapılmadı. Yerel Rust kontrolü ağ veya araç eksikliği nedeniyle sonuçlanmazsa yayın iş akışında ayrıca derleme doğrulanmalıdır.

Kaynaklar: [Tauri updater](https://v2.tauri.app/plugin/updater/), [resmi Tauri GitHub Action](https://github.com/tauri-apps/tauri-action).
