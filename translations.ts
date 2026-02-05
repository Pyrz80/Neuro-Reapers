
export const translations: Record<string, any> = {
  tr: {
    title: "NEURO-REAPERS",
    subtitle: "Dijital ruhlar siliniyor. Arşivi geri al. Antikor protokolünü çalıştır.",
    boot_protocol: "PROTOKOLÜ_BAŞLAT",
    reboot_core: "ÇEKİRDEĞİ_YENİDEN_BAŞLAT",
    system_ready: "[SİSTEM HAZIR]",
    awaiting_sync: "[SENKRONİZASYON BEKLENİYOR]",
    rebooting: "[YENİDEN BAŞLATILIYOR...]",
    antibody_deployed: "[ANTİKOR YERLEŞTİRİLDİ]",
    data_loss: "VERİ KAYBI TESPİT EDİLDİ",
    recovered: "KURTARILAN",
    erased: "SİLİNEN",
    stability: "STABİLİTE",
    system_sync: "SİSTEM_SENKR",
    virus_breach: "VİRÜS_İHLALİ",
    memory_fragments: "Bellek_Parçacıkları",
    core_integrity: "ÇEKİRDEK_BÜTÜNLÜĞÜ",
    sync: "SENKR",
    uptime: "ÇALIŞMA_SÜRESİ",
    kernel_patch: "ÇEKİRDEK YAMASI",
    opt_required: "Sistem Optimizasyonu Gerekli",
    execute: "ÇALIŞTIR",
    warning_boss: "UYARI: KÖK_VİRÜS_TESPİT_EDİLDİ",
    threat_eliminate: "SİSTEM BÜTÜNLÜĞÜ BOZULDU - TEHDİDİ YOK ET",
    about: "HAKKIMIZDA",
    settings: "AYARLAR",
    back: "GERİ",
    main_menu: "ANA MENÜ",
    resume: "DEVAM ET",
    audio: "SES AYARLARI",
    effects: "EFEKTLER",
    master: "ANA SES",
    on: "AÇIK",
    off: "KAPALI",
    about_text: "Bu oyun AvP Games tarafından hazırlanmıştır. İnsanlık hafızasının son kalesini savunan bir antikor olarak görev yapıyorsunuz. Tüm hakları saklıdır. @2024 AvP Games Lab."
  },
  en: {
    title: "NEURO-REAPERS",
    subtitle: "Digital souls are being erased. Reclaim the archive. Execute the antibody protocol.",
    boot_protocol: "BOOT_PROTOCOL",
    reboot_core: "REBOOT_CORE",
    system_ready: "[SYSTEM READY]",
    awaiting_sync: "[AWAITING SYNC]",
    rebooting: "[REBOOTING...]",
    antibody_deployed: "[ANTIBODY DEPLOYED]",
    data_loss: "DATA LOSS DETECTED",
    recovered: "RECOVERED",
    erased: "ERASED",
    stability: "STABILITY",
    system_sync: "SYSTEM_SYNC",
    virus_breach: "VIRUS_BREACH",
    memory_fragments: "Memory_Fragments",
    core_integrity: "CORE_INTEGRITY",
    sync: "SYNC",
    uptime: "UPTIME",
    kernel_patch: "KERNEL PATCH",
    opt_required: "System Optimization Required",
    execute: "EXECUTE",
    warning_boss: "WARNING: ROOT_VIRUS_DETECTED",
    threat_eliminate: "SYSTEM INTEGRITY COMPROMISED - ELIMINATE THREAT",
    about: "ABOUT US",
    settings: "SETTINGS",
    back: "BACK",
    main_menu: "MAIN MENU",
    resume: "RESUME",
    audio: "AUDIO SETTINGS",
    effects: "EFFECTS",
    master: "MASTER VOLUME",
    on: "ON",
    off: "OFF",
    about_text: "This game was prepared by AvP Games. You act as an antibody defending the last bastion of human memory. All rights reserved. @2024 AvP Games Lab."
  }
};

export const getLanguage = () => {
  const lang = navigator.language.split('-')[0];
  return translations[lang] ? lang : 'en';
};

export const t = (key: string) => {
  const lang = getLanguage();
  return translations[lang][key] || translations['en'][key] || key;
};
