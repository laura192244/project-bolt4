export async function translateText(text: string, target: "en" | "hy") {
    if (target === "hy") return text;

    try {
        const res = await fetch("https://libretranslate.de/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                q: text,        // <-- FIXED
                source: "hy",
                target: "en",
                format: "text"
            })
        });

        const data = await res.json();
        return data.translatedText || text;

    } catch (error) {
        console.error("Translation error:", error);
        return text; // fallback
    }
}
