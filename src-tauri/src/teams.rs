use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use fs2::FileExt;
use reqwest::{Client, Method, Response};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    path::{Path, PathBuf},
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tauri::Manager;
use uuid::Uuid;

const PDF_LIMIT: usize = 25 * 1024 * 1024;
#[derive(Default)]
pub struct Service(pub tokio::sync::Mutex<()>);
#[derive(Default, Serialize, Deserialize)]
struct Vault {
    config: Option<Config>,
    session: Option<Session>,
}
#[derive(Clone, Serialize, Deserialize)]
struct Config {
    url: String,
    key: String,
}
#[derive(Clone, Serialize, Deserialize)]
struct Session {
    access_token: String,
    refresh_token: String,
    expires_at: u64,
    user_id: String,
    email: String,
}
#[derive(Deserialize)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum Request {
    Status,
    Configure {
        url: String,
        key: String,
    },
    RequestCode {
        email: String,
    },
    VerifyCode {
        email: String,
        code: String,
    },
    PasswordLogin {
        email: String,
        password: String,
    },
    Logout,
    Snapshot {
        team_id: Option<Uuid>,
    },
    Create {
        name: String,
        display_name: String,
    },
    Join {
        code: String,
        display_name: String,
    },
    Invite {
        team_id: Uuid,
        revoke: bool,
    },
    RemoveMember {
        team_id: Uuid,
        user_id: Uuid,
    },
    SaveSlot {
        team_id: Uuid,
        id: Option<Uuid>,
        revision: Option<i32>,
        title: String,
        topic: String,
        starts_at: String,
        duration: i32,
    },
    DeleteSlot {
        id: Uuid,
        revision: i32,
    },
    Attend {
        id: Uuid,
        going: bool,
    },
    Upload {
        team_id: Uuid,
        name: String,
        bytes: Vec<u8>,
    },
    Download {
        id: Uuid,
    },
    DeleteFile {
        id: Uuid,
    },
}
fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
fn validate_config(url: &str, key: &str) -> Result<Config, String> {
    let parsed = reqwest::Url::parse(url.trim()).map_err(|_| "Proje adresi geçerli değil.")?;
    let host = parsed.host_str().unwrap_or_default();
    let project = host.strip_suffix(".supabase.co").unwrap_or_default();
    if parsed.scheme() != "https"
        || project.is_empty()
        || !project
            .bytes()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == b'-')
        || parsed.port().is_some()
        || !parsed.username().is_empty()
        || parsed.password().is_some()
        || parsed.path() != "/"
        || parsed.query().is_some()
        || parsed.fragment().is_some()
    {
        return Err("HTTPS Supabase proje adresini kullan. Örnek: https://proje.supabase.co".into());
    }
    let key = key.trim();
    let publishable = key.starts_with("sb_publishable_")
        && key.len() > 25
        && key.len() < 1000
        && key
            .bytes()
            .all(|c| c.is_ascii_alphanumeric() || c == b'_' || c == b'-');
    let anon = key
        .split('.')
        .nth(1)
        .and_then(|part| URL_SAFE_NO_PAD.decode(part).ok())
        .and_then(|bytes| serde_json::from_slice::<Value>(&bytes).ok())
        .and_then(|value| value.get("role").and_then(Value::as_str).map(str::to_owned))
        .as_deref()
        == Some("anon");
    if !publishable && !anon {
        return Err("Yalnız publishable veya anon public key kullan. Secret/service_role anahtarı kullanma.".into());
    }
    if key.len() > 4096 || key.contains(['\r', '\n']) {
        return Err("Proje anahtarı geçersiz.".into());
    }
    Ok(Config {
        url: format!("https://{host}"),
        key: key.into(),
    })
}
fn load(path: &Path) -> Result<Vault, String> {
    if path.exists() {
        let encrypted = std::fs::read(path).map_err(|_| "Takım bağlantısı okunamadı.")?;
        return serde_json::from_slice(&crate::ai_vault::protect(&encrypted, false)?)
            .map_err(|_| "Takım bağlantısı çözülemedi.".into());
    }
    let config = match (
        option_env!("STUDYOS_TEAM_URL"),
        option_env!("STUDYOS_TEAM_PUBLIC_KEY"),
    ) {
        (Some(url), Some(key)) if !url.is_empty() && !key.is_empty() => {
            Some(validate_config(url, key)?)
        }
        _ => None,
    };
    Ok(Vault {
        config,
        session: None,
    })
}
fn save(path: &Path, vault: &Vault) -> Result<(), String> {
    let bytes = serde_json::to_vec(vault).map_err(|_| "Takım bağlantısı hazırlanamadı.")?;
    let encrypted = crate::ai_vault::protect(&bytes, true)?;
    let temporary = path.with_extension("tmp");
    use std::io::Write;
    let mut file =
        std::fs::File::create(&temporary).map_err(|_| "Takım bağlantısı kaydedilemedi.")?;
    file.write_all(&encrypted)
        .and_then(|_| file.sync_all())
        .map_err(|_| "Takım bağlantısı kaydedilemedi.")?;
    drop(file);
    std::fs::rename(temporary, path).map_err(|_| "Takım bağlantısı yenilenemedi.".into())
}
fn status(v: &Vault) -> Value {
    json!({"configured":v.config.is_some(),"project_url":v.config.as_ref().map(|c|&c.url),"user_id":v.session.as_ref().map(|s|&s.user_id),"email":v.session.as_ref().map(|s|&s.email)})
}
async fn bytes(mut response: Response, limit: usize) -> Result<Vec<u8>, String> {
    if response
        .content_length()
        .is_some_and(|size| size > limit as u64)
    {
        return Err("Sunucu yanıtı çok büyük.".into());
    }
    let mut data = Vec::new();
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|_| "Sunucu yanıtı tamamlanamadı.")?
    {
        if data.len() + chunk.len() > limit {
            return Err("Sunucu yanıtı çok büyük.".into());
        }
        data.extend_from_slice(&chunk)
    }
    Ok(data)
}
async fn checked(response: Response, limit: usize) -> Result<Vec<u8>, String> {
    let code = response.status();
    let data = bytes(response, if code.is_success() { limit } else { 16384 }).await?;
    if !code.is_success() {
        if code.as_u16() == 401 {
            return Err("Takım oturumunun süresi dolmuş. Yeniden giriş yap.".into());
        }
        if code.as_u16() == 429 {
            return Err("Çok sık deneme yapıldı. Biraz bekleyip tekrar dene.".into());
        }
        let message = serde_json::from_slice::<Value>(&data)
            .ok()
            .and_then(|v| {
                ["message", "msg", "error_description"]
                    .iter()
                    .find_map(|key| v.get(key).and_then(Value::as_str).map(str::to_owned))
            })
            .unwrap_or_else(|| format!("Takım hizmeti isteği tamamlanamadı ({code})."));
        return Err(message.chars().take(240).collect());
    }
    Ok(data)
}
async fn request(
    client: &Client,
    c: &Config,
    method: Method,
    path: &str,
    token: Option<&str>,
    body: Option<Value>,
) -> Result<Value, String> {
    let mut call = client
        .request(method, format!("{}{path}", c.url))
        .header("apikey", &c.key);
    if let Some(token) = token {
        call = call.bearer_auth(token)
    }
    if let Some(body) = body {
        call = call.json(&body)
    }
    let response = call
        .send()
        .await
        .map_err(|_| "Takım hizmetine ulaşılamadı. Bağlantını kontrol et.")?;
    let data = checked(response, 2 * 1024 * 1024).await?;
    if data.is_empty() {
        Ok(Value::Null)
    } else {
        serde_json::from_slice(&data).map_err(|_| "Takım hizmeti yanıtı okunamadı.".into())
    }
}
fn parse_session(value: Value) -> Result<Session, String> {
    let get = |key: &str| {
        value
            .get(key)
            .and_then(Value::as_str)
            .filter(|s| !s.is_empty())
            .map(str::to_owned)
            .ok_or("Oturum yanıtı eksik.")
    };
    let user_id = value
        .pointer("/user/id")
        .and_then(Value::as_str)
        .ok_or("Hesap bilgisi eksik.")?
        .to_owned();
    Uuid::parse_str(&user_id).map_err(|_| "Hesap kimliği geçersiz.")?;
    Ok(Session {
        access_token: get("access_token")?,
        refresh_token: get("refresh_token")?,
        expires_at: value.get("expires_at").and_then(Value::as_u64).unwrap_or(
            now()
                + value
                    .get("expires_in")
                    .and_then(Value::as_u64)
                    .unwrap_or(3600),
        ),
        user_id,
        email: value
            .pointer("/user/email")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .into(),
    })
}
async fn session(client: &Client, v: &mut Vault, path: &Path) -> Result<Session, String> {
    let current = v.session.clone().ok_or("Önce takım hesabına giriş yap.")?;
    if current.expires_at > now() + 60 {
        return Ok(current);
    }
    let result = request(
        client,
        v.config.as_ref().ok_or("Proje bağlantısı eksik.")?,
        Method::POST,
        "/auth/v1/token?grant_type=refresh_token",
        None,
        Some(json!({"refresh_token":current.refresh_token})),
    )
    .await?;
    let next = parse_session(result)?;
    v.session = Some(next.clone());
    save(path, v)?;
    Ok(next)
}
async fn rpc(
    client: &Client,
    c: &Config,
    s: &Session,
    name: &str,
    args: Value,
) -> Result<Value, String> {
    request(
        client,
        c,
        Method::POST,
        &format!("/rest/v1/rpc/{name}"),
        Some(&s.access_token),
        Some(args),
    )
    .await
}
fn email(value: &str) -> Result<String, String> {
    let value = value.trim();
    if value.len() > 254 || !value.contains('@') || value.contains(['\r', '\n', ' ']) {
        Err("Geçerli bir e-posta adresi yaz.".into())
    } else {
        Ok(value.into())
    }
}
fn object_path(value: &str) -> Result<&str, String> {
    let parts: Vec<_> = value.split('/').collect();
    if parts.len() != 3
        || Uuid::parse_str(parts[0]).is_err()
        || Uuid::parse_str(parts[1]).is_err()
        || Uuid::parse_str(parts[2].strip_suffix(".pdf").unwrap_or("")).is_err()
    {
        return Err("Kaynak konumu geçersiz.".into());
    }
    Ok(value)
}
#[tauri::command]
pub async fn teams_call(
    app: tauri::AppHandle,
    service: tauri::State<'_, Service>,
    input: Request,
) -> Result<Value, String> {
    let _guard = service.0.lock().await;
    let dir: PathBuf = app
        .path()
        .app_data_dir()
        .map_err(|_| "Uygulama klasörü bulunamadı.")?;
    std::fs::create_dir_all(&dir).map_err(|_| "Uygulama klasörü açılamadı.")?;
    let lock = std::fs::OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .truncate(false)
        .open(dir.join("teams-session.lock"))
        .map_err(|_| "Takım oturumu kilitlenemedi.")?;
    lock.try_lock_exclusive().map_err(|_| {
        "Başka bir StudyOS penceresi takım oturumunu kullanıyor. Biraz sonra tekrar dene."
    })?;
    let path = dir.join("teams-session.dpapi");
    let mut v = load(&path)?;
    if matches!(input, Request::Status) {
        return Ok(status(&v));
    }
    if let Request::Configure { url, key } = input {
        v = Vault {
            config: Some(validate_config(&url, &key)?),
            session: None,
        };
        save(&path, &v)?;
        return Ok(status(&v));
    }
    let c = v
        .config
        .clone()
        .ok_or("Takım hizmeti henüz bağlanmadı. Önce proje kurulumunu tamamla.")?;
    let client = Client::builder()
        .timeout(Duration::from_secs(45))
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|_| "Bağlantı hazırlanamadı.")?;
    match input {
        Request::RequestCode { email: address } => {
            request(
                &client,
                &c,
                Method::POST,
                "/auth/v1/otp",
                None,
                Some(json!({"email":email(&address)?,"create_user":true})),
            )
            .await?;
            return Ok(json!({"sent":true}));
        }
        Request::VerifyCode {
            email: address,
            code,
        } => {
            let code = code.trim();
            if code.len() < 6 || code.len() > 10 || !code.bytes().all(|c| c.is_ascii_digit()) {
                return Err("E-postandaki doğrulama kodunu yaz.".into());
            }
            let result = request(
                &client,
                &c,
                Method::POST,
                "/auth/v1/verify",
                None,
                Some(json!({"email":email(&address)?,"token":code,"type":"email"})),
            )
            .await?;
            v.session = Some(parse_session(result)?);
            save(&path, &v)?;
            return Ok(status(&v));
        }
        Request::PasswordLogin {
            email: address,
            password,
        } => {
            if password.len() > 256 || password.is_empty() {
                return Err("Parolanı kontrol et.".into());
            }
            let result = request(
                &client,
                &c,
                Method::POST,
                "/auth/v1/token?grant_type=password",
                None,
                Some(json!({"email":email(&address)?,"password":password})),
            )
            .await?;
            v.session = Some(parse_session(result)?);
            save(&path, &v)?;
            return Ok(status(&v));
        }
        Request::Logout => {
            if let Some(s) = &v.session {
                let _ = request(
                    &client,
                    &c,
                    Method::POST,
                    "/auth/v1/logout?scope=local",
                    Some(&s.access_token),
                    None,
                )
                .await;
            }
            v.session = None;
            save(&path, &v)?;
            return Ok(status(&v));
        }
        _ => {}
    }
    let s = session(&client, &mut v, &path).await?;
    match input{
  Request::Snapshot{team_id}=>rpc(&client,&c,&s,"study_team_snapshot",json!({"p_team_id":team_id})).await,
  Request::Create{name,display_name}=>rpc(&client,&c,&s,"study_team_create",json!({"p_name":name,"p_display_name":display_name})).await,
  Request::Join{code,display_name}=>rpc(&client,&c,&s,"study_team_join",json!({"p_code":code,"p_display_name":display_name})).await,
  Request::Invite{team_id,revoke}=>rpc(&client,&c,&s,"study_team_invite",json!({"p_team_id":team_id,"p_revoke":revoke})).await,
  Request::RemoveMember{team_id,user_id}=>rpc(&client,&c,&s,"study_team_remove_member",json!({"p_team_id":team_id,"p_user_id":user_id})).await,
  Request::SaveSlot{team_id,id,revision,title,topic,starts_at,duration}=>rpc(&client,&c,&s,"study_team_save_slot",json!({"p_team_id":team_id,"p_id":id,"p_revision":revision,"p_title":title,"p_topic":topic,"p_starts_at":starts_at,"p_duration":duration})).await,
  Request::DeleteSlot{id,revision}=>rpc(&client,&c,&s,"study_team_delete_slot",json!({"p_id":id,"p_revision":revision})).await,
  Request::Attend{id,going}=>rpc(&client,&c,&s,"study_team_attend",json!({"p_id":id,"p_going":going})).await,
  Request::Upload{team_id,name,bytes:data}=>{
   if data.len()>PDF_LIMIT||!data.starts_with(b"%PDF-")||name.trim().is_empty()||name.chars().count()>150{return Err("Geçerli, en fazla 25 MB bir PDF seç.".into())}
   let id=Uuid::new_v4();let object=format!("{team_id}/{}/{id}.pdf",s.user_id);let size=data.len();
   let response=client.post(format!("{}/storage/v1/object/study-team-files/{object}",c.url)).header("apikey",&c.key).bearer_auth(&s.access_token).header("Content-Type","application/pdf").header("x-upsert","false").body(data).send().await.map_err(|_|"PDF yüklenemedi.")?;checked(response,16384).await?;
   match rpc(&client,&c,&s,"study_team_add_file",json!({"p_team_id":team_id,"p_id":id,"p_name":name,"p_size":size})).await{
    Ok(result)=>Ok(result),Err(error)=>{let cleanup=request(&client,&c,Method::DELETE,"/storage/v1/object/study-team-files",Some(&s.access_token),Some(json!({"prefixes":[object]}))).await;if cleanup.is_err(){return Err(format!("{error} Yarım kalan yüklemenin sunucuda temizlenmesi gerekebilir."))}Err(error)}
   }
  },
  Request::Download{id}=>{
   let rows=request(&client,&c,Method::GET,&format!("/rest/v1/study_team_files?id=eq.{id}&deleting=eq.false&select=name,storage_path"),Some(&s.access_token),None).await?;
   let row=rows.as_array().and_then(|rows|rows.first()).ok_or("Kaynak bulunamadı veya erişimin yok.")?;
   let object=object_path(row.get("storage_path").and_then(Value::as_str).unwrap_or_default())?;
   let response=client.get(format!("{}/storage/v1/object/authenticated/study-team-files/{object}",c.url)).header("apikey",&c.key).bearer_auth(&s.access_token).send().await.map_err(|_|"PDF indirilemedi.")?;
   let data=checked(response,PDF_LIMIT).await?;if !data.starts_with(b"%PDF-"){return Err("Kaynak geçerli bir PDF değil.".into())}Ok(json!({"name":row["name"],"bytes":data}))
  },
  Request::DeleteFile{id}=>{
   let value=rpc(&client,&c,&s,"study_team_delete_file",json!({"p_id":id,"p_finish":false})).await?;
   let object=object_path(value.as_str().ok_or("Kaynak konumu bulunamadı.")?)?;
   request(&client,&c,Method::DELETE,"/storage/v1/object/study-team-files",Some(&s.access_token),Some(json!({"prefixes":[object]}))).await?;
   rpc(&client,&c,&s,"study_team_delete_file",json!({"p_id":id,"p_finish":true})).await
  },_=>Err("Takım işlemi desteklenmiyor.".into())
 }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rejects_private_keys_and_non_supabase_targets() {
        assert!(validate_config("http://localhost", "sb_publishable_abcdefghijklmnop").is_err());
        assert!(validate_config(
            "https://project.supabase.co.attacker.test",
            "sb_publishable_abcdefghijklmnop"
        )
        .is_err());
        assert!(
            validate_config("https://project.supabase.co", "sb_secret_abcdefghijklmnop").is_err()
        );
        assert!(validate_config(
            "https://project.supabase.co",
            "sb_publishable_abcdefghijklmnop"
        )
        .is_ok());
    }
    #[test]
    fn remote_object_paths_cannot_escape_the_bucket() {
        assert!(object_path("../other/path.pdf").is_err());
        assert!(object_path("10000000-0000-4000-8000-000000000001/10000000-0000-4000-8000-000000000002/10000000-0000-4000-8000-000000000003.pdf").is_ok());
    }
}
