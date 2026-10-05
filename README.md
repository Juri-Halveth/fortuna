<!-- HUB_LANGUAGES_V1 -->
[Original / Deutsch](README.md) · [English](README.en.md) · [Русский](README.ru.md)
<!-- /HUB_LANGUAGES_V1 -->

# FORTUNA

Ein Windows-Programm zum Ordnen von Fenstern und zum Vergleichen eigener
Entscheidungsmoeglichkeiten.

## Was macht es?

- Zeigt laufende Fenster. Du waehlst aus, welches maximiert werden soll.
- Merkt sich vorher die Fensterposition. Du kannst sie wiederherstellen.
- Vergleicht eingegebene Moeglichkeiten nach Wahrscheinlichkeit, Ertrag,
  Kosten, Freude, Stabilitaet und Risiko.
- Speichert Profile und ein lokales Journal.
- Im Browserraum: **Kollektiv /70** zeigt die Einzelentscheidungen von 69
  Figurenprofilen und Fortuna zu selbst eingegebenen Möglichkeiten.

Der berechnete Wert ist eine Rangfolge deiner Eingaben. Er veraendert keine
Gewinnchancen in Spielen oder Casinos und verspricht keinen Gewinn.

## Einfach starten

Im lokalen Programmordner: `FortunaDesktop.exe` doppelklicken.
Python muss fuer diese EXE nicht extra installiert werden.

1. Unter **Arbeitsraum** ein Fenster auswaehlen.
2. **Auswahl maximieren** anklicken und bestaetigen.
3. Zum Zuruecksetzen den Restore-Punkt auswaehlen und
   **Auswahl wiederherstellen** anklicken.

Beim Schliessen werden Fenster nicht automatisch zurueckgesetzt.
Unter **Bewertung** eigene Eingaben eintragen und **Berechnen** anklicken.
Die anderen Bereiche heissen **Profile**, **Projekte**, **Quellen** und **Journal**.

## Wo sind meine Daten?

Auf deinem PC unter `%LOCALAPPDATA%\HALVETH\FortunaDesktop\v1`.
Dort liegen Einstellungen, Journal und Restore-Punkte. Deshalb ist der
Programmordner allein keine vollstaendige Datensicherung. Journaldateien
koennen Fenstertitel und lokale Pfade enthalten; nicht ungeprueft veroeffentlichen.

## Wo finde ich was?

- [Projekt auf GitHub](https://github.com/Juri-Halveth/fortuna)
- [FORTUNA-Fundstueck im Browser](https://juri-halveth.github.io/fortuna/)
- [Veroeffentlichungen und spaetere Downloads](https://github.com/Juri-Halveth/fortuna/releases)
- [Fragen und Fehler melden](https://github.com/Juri-Halveth/fortuna/issues)
- [HALVETH-Figurenraum](https://juri-halveth.github.io/halveth-scarlet/entities/)

**Stand dieser Veroeffentlichung:** Projektbeschreibung und Quellcode der
Browser-Verhaltenssimulation unter `docs/`. Noch kein oeffentlicher
EXE-Download und noch keine Veroeffentlichung des Desktop-Programmquellcodes in diesem
Repository. Der lokale Desktop-Stand traegt die Versionsnummer 1.3.0;
V4 bezeichnet das historische Build-Nachweispaket, nicht eine neue App-Version.
Die lokale EXE ist nicht digital signiert.

## Kollektiv im Browser

Im [FORTUNA-Raum](https://juri-halveth.github.io/fortuna/) unten
**Kollektiv /70** öffnen. Eigene Möglichkeiten eingeben oder ausdrücklich
erfundene Beispielwerte laden und **Gemeinsam auswählen** anklicken.
Alle 70 Einzelentscheidungen und Gewichte sind sichtbar. Ein Profil öffnet
seine stabile Adresse und seinen Identitätsanker. Unvollständige Eingaben
und gemeinsame Gleichstände bleiben offen.

Die Anfangsgewichte sind aus den Profiladressen abgeleitet. Alle Profile
verwenden dieselbe lokale Engine; eine Glückswirkung wurde nicht gemessen.
Eingaben werden im Browser berechnet und von dieser Seite nicht versendet.
Die 69 bewegten Figuren und die 70 Auswahlprofile sind getrennte Bestände.

Die Tests vergleichen die Browser-Rechnung mit vier gebundenen synthetischen
Desktop-Fällen und prüfen Identität, unvollständige Eingaben, Gleichstand und
ungültige Daten: `node --test docs/curiosity.test.mjs docs/collective.test.mjs`.

## Lizenz

Die Projektlizenz wird noch vom Rechteinhaber ausgewaehlt. Eine fertige
Open-Source-Lizenz ist hier noch nicht erteilt. Die Lizenztexte der verwendeten
Bibliotheken bleiben davon getrennt. Vor einer Download-Freigabe werden die
mitgelieferten Komponenten und ihre Hinweise geprueft.

## Freiwillig unterstuetzen

Eine bestaetigte Spenden- oder Supportseite ist noch nicht hinterlegt.
Es gibt derzeit keinen Zahlungsbutton. Unterstuetzung wird nicht mit besseren
Spielchancen oder garantierten Ergebnissen verbunden.

## FORTUNA als Fundstueck

Die Browser-Szene zeigt einen leuchtenden Seelenstein mit 69 Figuren. Sein sichtbarer
Anfangsname ist **Unbekanntes Objekt**. Beim Erkunden werden Herkunft,
Programmhinweise und spaeter das freigegebene Quellarchiv sichtbar.

Jede Figur prueft ihren eigenen beobachtbaren Zustand: Untersuchung fertig?
Gedraenge? Stillstand ohne neue Beobachtung? Daraus waehlt ihre lokale Regel
zwischen Fortsetzen und Umgebung erkunden. Eine Frage im Raum ist ein Eingang,
kein gemeinsamer Befehl und keine vorgegebene Antwort. Nach dem Fund gehen die
Figuren weiter, statt dauerhaft im Kreis zu bleiben.

Das ist eine lokale Verhaltenssimulation, kein angeschlossener KI-Dienst.
Im Detailfenster wird ein konkreter Entscheidungsgrund angezeigt. Der Bestand
der oeffentlichen Scarlet-Welt wurde nicht ersetzt; dies ist der eigene
FORTUNA-Raum. Die kopierten Figuren und Daten sind an den Scarlet-Commit
`15f5df46e20e34bc06bc7d7676c7fd094ebb39f4` gebunden. Lizenzhinweise: `docs/NOTICE.md`.

Ein Hash ist dabei ein Fingerabdruck des Quellarchivs, kein Ersatz fuer dessen
Inhalt. Das Archiv bleibt lokal als Datei erhalten und wird hier noch nicht
zum Download angeboten. Die Browser-Szene benoetigt weder Wallet noch Login.

Tests: `node --test docs/curiosity.test.mjs`. Die automatische Verhaltenspruefung
deckt 69 Figuren, individuelle Auswahl, Pausieren, weitere Bewegung und den
Unterschied zwischen Frage und Befehl ab.
