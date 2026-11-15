use tauri_plugin_notification::NotificationExt;

// Return delivery errors to the interface instead of discarding the plugin's promise.
#[tauri::command]
pub fn study_notify(app: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    let json = super::load_state(app.clone())?.ok_or("Bildirim izni verilmedi.")?;
    let state: serde_json::Value = serde_json::from_str(&json).map_err(|e| e.to_string())?;
    if state.pointer("/companion/notifications").and_then(|value| value.as_bool()) != Some(true) {
        return Err("Bildirim izni verilmedi.".into());
    }
    if title.chars().count() > 100 || body.chars().count() > 500 {
        return Err("Bildirim metni çok uzun.".into());
    }
    app.notification().builder().title(title).body(body).show().map_err(|e| e.to_string())
}
