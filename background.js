chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === "anastasia:fetch-config") {
        fetch("https://raw.githubusercontent.com/bylka2W/Anastasia/main/config.json", { cache: "no-store" })
            .then(r => r.json())
            .then(cfg => sendResponse({ ok: true, cfg }))
            .catch(err => sendResponse({ ok: false, error: String(err) }));
        return true;
    }
});