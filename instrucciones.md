# Tarea: Crear Scraper para [Nombre del Sitio]

## Información del Sitio
- **URL Base:** https://tioanime.com (o la que elijas)
- **Motor:** Hayase Extension (JavaScript ESM)

## Requerimientos Técnicos
1. Reclica la estructura del archivo `nekobt.js` que te pasé:
   - Usa `export default new class`.
   - Implementa el método `test()` para verificar si el sitio está online.
   - Implementa `search(query)` que devuelva un array de objetos con `{title, link, image}`.
2. Lógica de Scraping:
   - Usa `fetch` para obtener el HTML de la página de búsqueda.
   - Extrae los links de los episodios y los servidores de video.
3. Selectores CSS:
   - Items: `.anime`
   - Links: `.anime > a`
   - Imágenes: `.thumb img`

## Output Esperado
Dame el código completo en un solo bloque de código listo para guardar como `.js`.
