// JKAnime Extension for Hayase
// Base URL: https://jkanime.net/

export default new class {
  constructor() {
    this.name = "JKAnime";
    this.baseUrl = atob("aHR0cHM6Ly9qa2FuaW1lLm5ldA=="); // https://jkanime.net
  }

  async test() {
    try {
      const res = await fetch(`${this.baseUrl}/`, { method: "HEAD" });
      return res.ok;
    } catch (e) {
      throw new Error("JKAnime: Sitio no disponible");
    }
  }

  async search(query) {
    try {
      const url = `${this.baseUrl}/buscar/${encodeURIComponent(query)}/`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("JKAnime: Error al obtener resultados");

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // JKAnime search results: div.anime_info cards
      const items = doc.querySelectorAll(".anime_info");
      const results = [];

      for (const item of items) {
        const anchor = item.querySelector("a");
        const img = item.querySelector("img");
        const titleEl = item.querySelector("h3, .title");

        if (!anchor) continue;

        const link = anchor.href.startsWith("http") ? anchor.href : `${this.baseUrl}${anchor.getAttribute("href")}`;
        const title = titleEl?.textContent?.trim() || anchor.getAttribute("title") || "";
        const imgUrl = img?.getAttribute("src") || "";
        const image = imgUrl.startsWith("http") ? imgUrl : `${this.baseUrl}${imgUrl}`;

        results.push({ title, link, image });
      }

      return results;
    } catch (e) {
      throw new Error(`JKAnime: search() falló — ${e.message}`);
    }
  }

  async single(ids, info) {
    try {
      // ids[0] = URL completa del anime
      const res = await fetch(ids[0]);
      if (!res.ok) throw new Error("JKAnime: Error al cargar la página del anime");

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // JKAnime paginates episodes in a numeric list
      const episodeLinks = doc.querySelectorAll(".anime__pagination a:not([class]), .cap_list a");
      const episodes = [];

      for (const a of episodeLinks) {
        const href = a.getAttribute("href") || "";
        const link = href.startsWith("http") ? href : `${this.baseUrl}${href}`;
        const num = a.textContent.trim();
        if (num) {
          episodes.push({ title: `Episodio ${num}`, id: link });
        }
      }

      return { info, episodes };
    } catch (e) {
      throw new Error(`JKAnime: single() falló — ${e.message}`);
    }
  }
}
