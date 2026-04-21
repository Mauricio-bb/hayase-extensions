// Mundo Donghua Extension for Hayase
// Base URL: https://www.mundodonghua.com/

export default new class {
  constructor() {
    this.name = "MundoDonghua";
    this.baseUrl = atob("aHR0cHM6Ly93d3cubXVuZG9kb25naHVhLmNvbQ=="); // https://www.mundodonghua.com
  }

  async test() {
    try {
      const res = await fetch(`${this.baseUrl}/`, { method: "HEAD" });
      return res.ok;
    } catch (e) {
      throw new Error("MundoDonghua: Sitio no disponible");
    }
  }

  async search(query) {
    try {
      const url = `${this.baseUrl}/lista-donghuas?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("MundoDonghua: Error al obtener resultados");

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Selector más específico para evitar duplicados en la lista
      const items = doc.querySelectorAll(".donghua-item, .portada-item");
      const results = [];

      for (const item of items) {
        const anchor = item.tagName === "A" ? item : item.querySelector("a");
        const img = item.querySelector("img");
        const titleEl = item.querySelector(".tit, h3, .title");

        if (!anchor) continue;

        const link = anchor.href.startsWith("http") ? anchor.href : `${this.baseUrl}${anchor.getAttribute("href")}`;
        const title = titleEl?.textContent?.trim() || anchor.getAttribute("title") || "";
        const imgUrl = img?.getAttribute("src") || "";
        const image = imgUrl.startsWith("http") ? imgUrl : `${this.baseUrl}${imgUrl}`;

        if (title) results.push({ title, link, image });
      }

      return results;
    } catch (e) {
      throw new Error(`MundoDonghua: search() falló — ${e.message}`);
    }
  }

  async single(ids, info) {
    try {
      // ids[0] = URL completa del donghua
      const res = await fetch(ids[0]);
      if (!res.ok) throw new Error("MundoDonghua: Error al cargar la página del donghua");

      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Episode list: rows with episode anchors
      const episodeAnchors = doc.querySelectorAll(".caplist a, .lista-capitulos a, .cap-list a");
      const episodes = [];

      for (const a of episodeAnchors) {
        const label = a.textContent.trim();
        if (!label || label.toLowerCase().includes("próximo")) continue;

        const link = a.href.startsWith("http") ? a.href : `${this.baseUrl}${a.getAttribute("href")}`;
        if (link && label) {
          episodes.push({ title: label, id: link });
        }
      }

      return { info, episodes };
    } catch (e) {
      throw new Error(`MundoDonghua: single() falló — ${e.message}`);
    }
  }
}
