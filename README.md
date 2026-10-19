# Musicala × Fundación San Antonio · GMMMC 2027

Propuesta institucional de formación artística para el Gimnasio Monseñor Manuel María Camargo. Una sola web estática, con recursos incluidos y sin servicios de backend propios.

## Abrir

Abrir `index.html` directamente o servir esta carpeta con cualquier servidor estático. Por ejemplo: `python -m http.server 8000`, y visitar `http://localhost:8000`.

## Experiencia

- Metodología CREA con evidencia real; diagnóstico, objetivos, evaluación y continuidad.
- Danza, porrismo y artes plásticas; música y ensamble como posible ampliación.
- Fotos, capturas y páginas de materiales pedagógicos integradas en contexto.
- Botones de acceso a AutoMusicala Piano, HUB Estudiantes, HUB Docentes, HUB Líderes y muestras de proceso. Abren nuevas pestañas con `noopener noreferrer`; los HUB pueden requerir acceso autorizado.
- Presentación con flechas, espacio y Escape; conserva su posición al explorar aplicaciones externas.
- Simulador editable tanto en la página como en presentación: fechas, grupos, duración, profesionales, exclusiones y eventos. Exporta CSV e ICS.
- Descarga PDF local con el escenario actual y evidencias. Las dependencias de exportación están incluidas y se cargan al solicitar la descarga.

## Tarifa y alcance

$90.000 COP por sesión de 90 minutos por profesional, equivalente a $60.000 por hora. Aplica a las disciplinas y posibles ampliaciones. Los eventos extraordinarios se calculan por horas y profesionales; la gestión integral y los extras logísticos se cotizan aparte. El escenario del simulador es preliminar y no constituye una agenda contratada.

## Recursos

`assets/media/` contiene únicamente los medios utilizados por esta propuesta. Los nombres de personas en las capturas de gestión se retiraron en las copias de publicación; los originales locales no se alteraron. `assets/media/manifest.json` registra los archivos incluidos y tratamientos. Los logos oficiales mantienen colores y proporciones. Las ilustraciones de instrumentos son originales del proyecto.

Los documentos de piano y danza son ejemplos institucionales de Musicala; no se afirma su uso específico en GMMMC. La foto de ensamble se identifica como referencia Musicala. Los referentes de festivales no son agenda 2027 confirmada.

## Estructura

- `index.html`: propuesta principal.
- `assets/`: estilos, interacciones, logos, medios e instrumentos.
- `assets/vendor/`: jsPDF y html2canvas con licencias MIT.
- `tests/`: verificación de navegación, recursos, calendario y presentación.

La fuente 2026 se consultó solo para recuperar elementos pedagógicos. No se importaron sus condiciones comerciales históricas. El repositorio excluye carpetas privadas, borradores, historial de revisión y archivos temporales del entorno de trabajo.

## Verificación

Escritorio y móvil: 360, 390, 768, 1024 y 1440 px. Botones externos: destino, pestaña nueva, aislamiento de `opener`, conservación del punto de lectura y posición de presentación. Se verifican recursos locales, CREA, simulador y exportación PDF. Para ejecutar la prueba portable: `npm install` y `npm test`; requiere un navegador Chromium de Playwright (`npx playwright install chromium`) o la variable `BROWSER_CHANNEL=msedge` si Edge está instalado.

Subir el código no cambia la configuración de hosting. Puede alojarse en GitHub Pages cuando se configure ese servicio.
