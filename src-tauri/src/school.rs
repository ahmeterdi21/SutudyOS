use reqwest::{Client, Url};
use serde::Serialize;
use std::{
    net::{IpAddr, SocketAddr},
    time::Duration,
};
const LIMIT: usize = 2 * 1024 * 1024;
fn public_ip(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v) => {
            let [a, b, c, _] = v.octets();
            !v.is_private()
                && !v.is_loopback()
                && !v.is_link_local()
                && !v.is_multicast()
                && !v.is_broadcast()
                && !v.is_unspecified()
                && a != 0
                && a < 224
                && !(a == 100 && (64..=127).contains(&b))
                && !(a == 192 && b == 0)
                && !(a == 198 && (b == 18 || b == 19 || b == 51 && c == 100))
                && !(a == 203 && b == 0 && c == 113)
        }
        IpAddr::V6(v) => {
            let s = v.segments();
            s[0] & 0xe000 == 0x2000
                && !(s[0] == 0x2001 && (s[1] < 0x200 || s[1] == 0xdb8))
                && s[0] != 0x2002
        }
    }
}
fn parse_url(raw: &str) -> Result<Url, String> {
    let u = Url::parse(raw).map_err(|_| "Geçerli bir https adresi gir.")?;
    if raw.len() > 2048
        || u.scheme() != "https"
        || !u.username().is_empty()
        || u.password().is_some()
        || u.port_or_known_default() != Some(443)
    {
        return Err("Yalnızca herkese açık HTTPS duyuru adresleri desteklenir.".into());
    }
    let host = u.host_str().ok_or("Adresin alan adı yok.")?;
    if !host.contains('.') || host.ends_with(".local") || host.ends_with(".localhost") {
        return Err("Yerel ağ adresleri desteklenmez.".into());
    }
    Ok(u)
}
#[derive(Serialize)]
pub struct Page {
    url: String,
    body: String,
    content_type: String,
}
#[tauri::command]
pub async fn school_fetch(url: String) -> Result<Page, String> {
    tokio::time::timeout(Duration::from_secs(30), fetch(&url))
        .await
        .map_err(|_| "Okul sitesinin yanıtı gecikti. Son kayıtlar korunuyor.".to_string())?
}
async fn fetch(raw: &str) -> Result<Page, String> {
    let mut url = parse_url(raw)?;
    for _ in 0..5 {
        let host = url.host_str().ok_or("Alan adı yok.")?;
        let addresses: Vec<SocketAddr> = tokio::net::lookup_host((host, 443))
            .await
            .map_err(|_| "Okul sitesine ulaşılamadı. İnternet bağlantını kontrol et.")?
            .collect();
        if addresses.is_empty() || addresses.iter().any(|a| !public_ip(a.ip())) {
            return Err("Bu adres herkese açık bir okul sitesi değil.".into());
        }
        // Pin validated DNS answers, including every redirect; never use local proxies or cookies.
        let client = Client::builder()
            .no_proxy()
            .redirect(reqwest::redirect::Policy::none())
            .resolve_to_addrs(host, &addresses)
            .timeout(Duration::from_secs(15))
            .user_agent("StudyOS-SchoolAnnouncements/1.0")
            .build()
            .map_err(|_| "Bağlantı hazırlanamadı.")?;
        let mut response = client
            .get(url.clone())
            .header(
                "Accept",
                "text/html, application/rss+xml, application/atom+xml, application/xml, text/xml",
            )
            .send()
            .await
            .map_err(|_| "Okul sitesi yanıt vermedi. Son kayıtlar korunuyor.")?;
        if response.status().is_redirection() {
            let target = response
                .headers()
                .get("location")
                .and_then(|h| h.to_str().ok())
                .ok_or("Yönlendirme okunamadı.")?;
            url = parse_url(
                url.join(target)
                    .map_err(|_| "Yönlendirme geçersiz.")?
                    .as_str(),
            )?;
            continue;
        }
        if !response.status().is_success() {
            return Err(format!(
                "Okul sitesi erişimi kabul etmedi ({}). Son kayıtlar korunuyor.",
                response.status().as_u16()
            ));
        }
        let content_type = response
            .headers()
            .get("content-type")
            .and_then(|h| h.to_str().ok())
            .unwrap_or("")
            .to_lowercase();
        if ![
            "text/html",
            "application/xhtml+xml",
            "application/rss+xml",
            "application/atom+xml",
            "application/xml",
            "text/xml",
            "text/plain",
        ]
        .iter()
        .any(|t| content_type.starts_with(t))
        {
            return Err(
                "Bir duyuru sayfası veya RSS bağlantısı gir; dosya bağlantısı desteklenmez.".into(),
            );
        }
        if response.content_length().is_some_and(|n| n > LIMIT as u64) {
            return Err("Duyuru sayfası çok büyük (en fazla 2 MB).".into());
        }
        let mut bytes = Vec::new();
        while let Some(chunk) = response.chunk().await.map_err(|_| "Sayfa eksik alındı.")? {
            if bytes.len() + chunk.len() > LIMIT {
                return Err("Duyuru sayfası çok büyük.".into());
            }
            bytes.extend_from_slice(&chunk)
        }
        let body = String::from_utf8(bytes).map_err(|_| {
            "Bu sayfanın eski metin kodlaması desteklenmiyor. Varsa RSS adresini kullan."
        })?;
        return Ok(Page {
            url: url.to_string(),
            body,
            content_type,
        });
    }
    Err("Okul sitesi çok fazla yönlendirme yapıyor.".into())
}
#[tauri::command]
pub fn school_open(url: String) -> Result<(), String> {
    let url = parse_url(&url)?;
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        std::process::Command::new("rundll32.exe")
            .args(["url.dll,FileProtocolHandler", url.as_str()])
            .creation_flags(0x08000000)
            .spawn()
            .map_err(|_| "Tarayıcı açılamadı.")?;
        Ok(())
    }
    #[cfg(not(windows))]
    {
        let _ = url;
        Err("Bağlantıyı Windows sürümünde açabilirsin.".into())
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn blocks_private_and_special_addresses() {
        for ip in [
            "127.0.0.1",
            "10.0.0.1",
            "169.254.169.254",
            "100.64.0.1",
            "192.0.2.1",
            "::1",
            "::ffff:127.0.0.1",
            "fc00::1",
            "2001:db8::1",
            "2002:7f00:1::",
        ] {
            assert!(!public_ip(ip.parse().unwrap()), "{ip}")
        }
        assert!(public_ip("1.1.1.1".parse().unwrap()));
    }
    #[test]
    fn limits_urls() {
        for u in [
            "file:///c:/a",
            "http://school.edu",
            "https://user:pass@school.edu/",
            "https://school.edu:444/",
            "https://localhost/",
        ] {
            assert!(parse_url(u).is_err())
        }
        assert!(parse_url("https://school.edu/duyurular").is_ok());
    }
}
