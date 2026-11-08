use std::{sync::Mutex, time::Duration};
use tauri_plugin_updater::{Update, UpdaterExt};

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct Config {
    repository: String,
    public_key: String,
}
pub struct Pending(pub Mutex<Option<Update>>);

#[derive(serde::Serialize)]
pub struct UpdateStatus {
    status: &'static str,
    version: Option<String>,
}

#[tauri::command]
pub async fn check_update(
    app: tauri::AppHandle,
    pending: tauri::State<'_, Pending>,
) -> Result<UpdateStatus, String> {
    if cfg!(debug_assertions) {
        return Ok(UpdateStatus {
            status: "development",
            version: None,
        });
    }
    let config: Config = serde_json::from_str(include_str!("../../release/update-config.json"))
        .map_err(|e| e.to_string())?;
    if config.repository.is_empty() || config.public_key.is_empty() {
        return Ok(UpdateStatus {
            status: "unconfigured",
            version: None,
        });
    }
    let parts: Vec<_> = config.repository.split('/').collect();
    if parts.len() != 2
        || parts.iter().any(|p| {
            p.is_empty()
                || !p
                    .chars()
                    .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_' || c == '.')
        })
    {
        return Err("Geçersiz güncelleme deposu.".into());
    }
    let url = format!(
        "https://github.com/{}/releases/latest/download/latest.json",
        config.repository
    );
    let update = app
        .updater_builder()
        .pubkey(config.public_key)
        .endpoints(vec![url.parse().map_err(|e| format!("{e}"))?])
        .map_err(|e| e.to_string())?
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?
        .check()
        .await
        .map_err(|e| e.to_string())?;
    let version = update.as_ref().map(|u| u.version.clone());
    *pending.0.lock().map_err(|e| e.to_string())? = update;
    Ok(UpdateStatus {
        status: if version.is_some() {
            "available"
        } else {
            "current"
        },
        version,
    })
}

#[tauri::command]
pub async fn install_update(
    app: tauri::AppHandle,
    pending: tauri::State<'_, Pending>,
) -> Result<(), String> {
    let update = {
        pending
            .0
            .lock()
            .map_err(|e| e.to_string())?
            .take()
            .ok_or("Güncelleme bulunamadı. Yeniden kontrol edin.")?
    };
    update
        .download_and_install(|_, _| {}, || {})
        .await
        .map_err(|e| e.to_string())?;
    app.restart();
}
