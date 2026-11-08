use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Default, Serialize, Deserialize)]
pub struct Vault {
    pub host_id: String,
    pub chatgpt: Option<Account>,
    pub gemini_key: Option<String>,
}
#[derive(Clone, Serialize, Deserialize)]
pub struct Account {
    pub subject: String,
    pub email: String,
    pub client_id: String,
    pub id_token: String,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: u64,
    pub scopes: String,
}

// Tokens never enter the study database, exported backups or webview storage.
#[cfg(windows)]
fn protect(bytes: &[u8], encrypt: bool) -> Result<Vec<u8>, String> {
    use windows_sys::Win32::{Foundation::LocalFree, Security::Cryptography::*};
    let input = CRYPT_INTEGER_BLOB {
        cbData: bytes.len() as u32,
        pbData: bytes.as_ptr() as *mut u8,
    };
    let mut output = CRYPT_INTEGER_BLOB {
        cbData: 0,
        pbData: std::ptr::null_mut(),
    };
    unsafe {
        let ok = if encrypt {
            CryptProtectData(
                &input,
                std::ptr::null(),
                std::ptr::null(),
                std::ptr::null_mut(),
                std::ptr::null(),
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output,
            )
        } else {
            CryptUnprotectData(
                &input,
                std::ptr::null_mut(),
                std::ptr::null(),
                std::ptr::null_mut(),
                std::ptr::null(),
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output,
            )
        };
        if ok == 0 {
            return Err("Bağlantı bilgileri Windows tarafından korunamadı veya açılamadı.".into());
        }
        let result = std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec();
        LocalFree(output.pbData as *mut _);
        Ok(result)
    }
}
#[cfg(not(windows))]
fn protect(_: &[u8], _: bool) -> Result<Vec<u8>, String> {
    Err("Güvenli hesap saklama bu sürümde Windows gerektirir.".into())
}
pub fn load(path: &Path) -> Result<Vault, String> {
    match std::fs::read(path) {
        Ok(bytes) => serde_json::from_slice(&protect(&bytes, false)?)
            .map_err(|_| "Bağlantı kaydı okunamadı.".into()),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(Vault::default()),
        Err(_) => Err("Bağlantı dosyası okunamadı.".into()),
    }
}
pub fn save(path: &Path, vault: &Vault) -> Result<(), String> {
    let bytes = serde_json::to_vec(vault).map_err(|_| "Bağlantı kaydı hazırlanamadı.")?;
    let encrypted = protect(&bytes, true)?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|_| "Bağlantı klasörü oluşturulamadı.")?;
    }
    let temporary = path.with_extension("tmp");
    use std::io::Write;
    let mut file =
        std::fs::File::create(&temporary).map_err(|_| "Bağlantı kaydı oluşturulamadı.")?;
    file.write_all(&encrypted)
        .and_then(|_| file.sync_all())
        .map_err(|_| "Bağlantı kaydı yazılamadı.")?;
    drop(file);
    std::fs::rename(temporary, path).map_err(|e| {
        format!(
            "Bağlantı kaydı yenilenemedi ({}).",
            e.raw_os_error().unwrap_or(0)
        )
    })
}
