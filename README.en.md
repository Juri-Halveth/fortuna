[Deutsch](README.md) · [English](README.en.md) · [Русский](README.ru.md)

# Fortuna · Compare options in your browser

**An explorable browser interface and local JavaScript models.** Enter options,
inspect weights and follow the resulting ranking. Characters in the browser
world use local rules.

[Open the application](https://juri-halveth.github.io/fortuna/) · [Portfolio](https://juri-halveth.github.io/en/)

The published code includes `docs/collective.mjs` for option comparison,
`docs/curiosity.mjs` for local character behaviour, the interface and model tests.

```sh
node --test docs/*.test.mjs
python -m http.server 8849 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:8849/`. This repository publishes the browser version.
The previously described local Windows tool has neither native source nor an
EXE download here. Rankings reflect supplied inputs, not measured improvements
in external winning probabilities. Outputs share the same local rule engine.

Project lead: Juri Halveth / HALVETH. AI-assisted development.
An overall project licence has not been granted; [component notices](docs/NOTICE.md)
retain their own terms. Contact: security@halveth.de.
