#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rusqlite::{params, Connection};
use tauri::Manager;
mod updates;
fn database(app: &tauri::AppHandle) -> Result<Connection, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let db = Connection::open(dir.join("studyos.sqlite3")).map_err(|e| e.to_string())?;
    db.execute_batch("PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), json TEXT NOT NULL); CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, bytes BLOB NOT NULL);").map_err(|e|e.to_string())?;
    Ok(db)
}
#[tauri::command]
fn load_state(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use rusqlite::OptionalExtension;
    database(&app)?
        .query_row("SELECT json FROM state WHERE id=1", [], |r| r.get(0))
        .optional()
        .map_err(|e| e.to_string())
}
#[tauri::command]
fn save_state(app: tauri::AppHandle, json: String) -> Result<(), String> {
    database(&app)?.execute("INSERT INTO state(id,json) VALUES(1,?1) ON CONFLICT(id) DO UPDATE SET json=excluded.json",[json]).map_err(|e|e.to_string())?;
    Ok(())
}
#[tauri::command]
fn put_pdf(app: tauri::AppHandle, id: String, bytes: Vec<u8>) -> Result<(), String> {
    if bytes.len() > 25 * 1024 * 1024 || !bytes.starts_with(b"%PDF-") {
        return Err("Geçerli, en fazla 25 MB bir PDF seçin.".into());
    }
    database(&app)?
        .execute(
            "INSERT INTO documents(id,bytes) VALUES(?1,?2)",
            params![id, bytes],
        )
        .map_err(|e| e.to_string())?;
    Ok(())
}
#[tauri::command]
fn get_pdf(app: tauri::AppHandle, id: String) -> Result<Vec<u8>, String> {
    database(&app)?
        .query_row("SELECT bytes FROM documents WHERE id=?1", [id], |r| {
            r.get(0)
        })
        .map_err(|e| e.to_string())
}
#[tauri::command]
fn delete_pdf(app: tauri::AppHandle, id: String, json: String) -> Result<(), String> {
    let mut db = database(&app)?;
    remove_pdf_transaction(&mut db, &id, &json)
}
fn remove_pdf_transaction(db: &mut Connection, id: &str, json: &str) -> Result<(), String> {
    let tx = db.transaction().map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM documents WHERE id=?1", [id])
        .map_err(|e| e.to_string())?;
    tx.execute(
        "INSERT INTO state(id,json) VALUES(1,?1) ON CONFLICT(id) DO UPDATE SET json=excluded.json",
        [json],
    )
    .map_err(|e| e.to_string())?;
    tx.commit().map_err(|e| e.to_string())
}
#[cfg(test)]
mod deletion_tests {
    use super::*;
    fn fixture() -> Connection {
        let db = Connection::open_in_memory().unwrap();
        db.execute_batch("CREATE TABLE state(id INTEGER PRIMARY KEY, json TEXT NOT NULL); CREATE TABLE documents(id TEXT PRIMARY KEY,bytes BLOB); INSERT INTO state VALUES(1,'before'); INSERT INTO documents VALUES('pdf',X'255044462D');").unwrap();
        db
    }
    #[test]
    fn removes_bytes_and_updates_metadata_together() {
        let mut db = fixture();
        remove_pdf_transaction(&mut db, "pdf", "after").unwrap();
        assert_eq!(
            db.query_row("SELECT count(*) FROM documents", [], |r| r.get::<_, i64>(0))
                .unwrap(),
            0
        );
        assert_eq!(
            db.query_row("SELECT json FROM state", [], |r| r.get::<_, String>(0))
                .unwrap(),
            "after"
        );
    }
    #[test]
    fn restores_pdf_when_metadata_write_fails() {
        let mut db = fixture();
        db.execute_batch("CREATE TRIGGER reject_update BEFORE UPDATE ON state BEGIN SELECT RAISE(ABORT,'test write failure'); END;").unwrap();
        assert!(remove_pdf_transaction(&mut db, "pdf", "after").is_err());
        assert_eq!(
            db.query_row("SELECT count(*) FROM documents", [], |r| r.get::<_, i64>(0))
                .unwrap(),
            1
        );
        assert_eq!(
            db.query_row("SELECT json FROM state", [], |r| r.get::<_, String>(0))
                .unwrap(),
            "before"
        );
    }
}
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(updates::Pending(std::sync::Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            load_state,
            save_state,
            put_pdf,
            get_pdf,
            delete_pdf,
            updates::check_update,
            updates::install_update
        ])
        .run(tauri::generate_context!())
        .expect("StudyOS başlatılamadı");
}
