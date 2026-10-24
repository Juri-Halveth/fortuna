[Deutsch](README.md) · [English](README.en.md) · [Русский](README.ru.md)

# Fortuna · Möglichkeiten im Browser vergleichen

**Person: Juri. Projekt: HALVETH.** [Namenszuordnung](IDENTITY.md).

**Eine erkundbare Browseroberfläche und lokale JavaScript-Modelle.**
Eigene Optionen eingeben, Gewichtungen ansehen und die resultierende Rangfolge
nachvollziehen. Die Figuren im Browserraum folgen lokalen Regeln.

[Anwendung öffnen](https://juri-halveth.github.io/fortuna/) · [Portfolio](https://juri-halveth.github.io/)

## Das liegt hier als Code vor

- `docs/collective.mjs`: transparente Bewertung gelieferter Optionen und Gewichte.
- `docs/curiosity.mjs`: lokale Verhaltensregeln für die Figuren.
- `docs/index.html`: Browseroberfläche mit Erkundungsraum und Detailansicht.
- Die zugehörigen Tests unter `docs/` prüfen die implementierten Verträge.

## Lokal starten

```sh
python -c "import http.server, os; os.chdir('docs'); http.server.SimpleHTTPRequestHandler.extensions_map['.mjs']='text/javascript'; http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler,port=8849,bind='127.0.0.1')"
node --test docs/*.test.mjs
```

Danach `http://127.0.0.1:8849/` öffnen.
Die Modul-Zuordnung ist ausdrücklich gesetzt, damit die Vorschau auch mit einer
abweichenden Windows-MIME-Registrierung JavaScript-Module ausführt.

## Reifegrad und Herkunft

Der veröffentlichte Bestand ist eine **Browserfassung**. Das früher beschriebene
lokale Windows-Projekt für Fensterorganisation besitzt in diesem Repository
weder einen veröffentlichten nativen Quellstand noch einen EXE-Download.

Die Bewertungen berechnen Rangfolgen aus Eingaben. Sie sind keine gemessene
Verbesserung externer Gewinnchancen. Alle Figuren verwenden lokale Regeln;
70 Ausgaben sind keine 70 unabhängig trainierten KI-Systeme.

Die kopierten Figuren und Daten stammen aus der Scarlet-Quellfassung
`15f5df46e20e34bc06bc7d7676c7fd094ebb39f4`. [Komponentenhinweise](docs/NOTICE.md).
Eine abschließende eigene Projektlizenz ist noch nicht erteilt; Fremdkomponenten
behalten ihre Bedingungen. Öffentliche Sichtbarkeit allein ist keine freie Lizenz.

Projektleitung: **Juri / HALVETH**. Entwicklung mit KI-Unterstützung.
Kontakt: **security@halveth.de**.
