fn main() {
    println!("cargo:rerun-if-env-changed=STUDYOS_TEAM_URL");
    println!("cargo:rerun-if-env-changed=STUDYOS_TEAM_PUBLIC_KEY");
    println!("cargo:rerun-if-changed=icons/icon.ico");
    let attributes = tauri_build::Attributes::new().windows_attributes(
        tauri_build::WindowsAttributes::new().window_icon_path("icons/icon.ico"),
    );
    tauri_build::try_build(attributes).expect("StudyOS build resources could not be generated");
}
