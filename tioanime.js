// TioAnime Extension for Hayase
// Base URL: https://tioanime.com/

export default new class {
  constructor() {
    this.name = "TioAnime";
    this.baseUrl = atob("aHR0cHM6Ly90aW9hbmltZS5jb20="); // https://tioanime.com
  }

  async test() {
    try {
      const res = await fetch(`${this.baseUrl}/`, { method: "HEAD" });
      return res.ok;
    } catch (e) {
      throw new Error("TioAnime: Sitio no disponible");
    }
  }

  async search(query) {
    try {
      const url = `${this.baseUrl}/directorio?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("TioAnime: Error al obtener resultados");

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // TioAnime selector: .anime items
      const items = doc.querySelectorAll(".anime");
      const results = [];

      for (const item of items) {
        const anchor = item.querySelector("a");
        const img = item.querySelector(".thumb img");
        const titleEl = item.querySelector("h3") || item.querySelector(".title");

        if (!anchor) continue;

        const href = anchor.getAttribute("href") || "";
        const link = href.startsWith("http") ? href : `${this.baseUrl}${href}`;
        const title = titleEl
          ? titleEl.textContent.trim()
          : anchor.getAttribute("title") || "";
        const image = img
          ? (img.getAttribute("src")?.startsWith("http")
              ? img.getAttribute("src")
              : `${this.baseUrl}${img.getAttribute("src")}`)
          : "";

        results.push({ title, link, image });
      }

      return results;
    } catch (e) {
      throw new Error(`TioAnime: search() falló — ${e.message}`);
    }
  }

  async single(ids, info) {
    try {
      // ids[0] = URL completa del anime
      const res = await fetch(ids[0]);
      if (!res.ok) throw new Error("TioAnime: Error al cargar la página del anime");

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // TioAnime stores episode list as JS variable: var episodes = [...]
      const scriptTags = doc.querySelectorAll("script");
      let episodes = [];

      for (const script of scriptTags) {
        const text = script.textContent;
        const match = text.match(/(?:var|let|const)\s+episodes\s*=\s*(\[[\s\S]*?\])\s*;/);
        if (match) {
          try {
            episodes = JSON.parse(match[1]);
          } catch (_) {}
          break;
        }
      }

      // Extract slug from URL to build episode links
      const slugMatch = ids[0].match(/\/anime\/([^/]+)/);
      const slug = slugMatch ? slugMatch[1] : "";

      const episodeList = episodes.map((ep) => {
        const num = Array.isArray(ep) ? ep[0] : ep;
        return {
          title: `Episodio ${num}`,
          id: `${this.baseUrl}/ver/${slug}-${num}`,
        };
      });

      return { info, episodes: episodeList };
    } catch (e) {
      throw new Error(`TioAnime: single() falló — ${e.message}`);
    }
  }
}
