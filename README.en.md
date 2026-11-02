[Deutsch](README.md) · [English](README.en.md) · [Русский](README.ru.md)

# Fortuna · Explore probability and compare options in your browser

**A local probability experiment and a separate option comparison.** The browser
uses Web Crypto for up to **999,999 draws per series**, comparing a baseline
chance with a user-supplied scenario and counting observed hits. You can also
enter options, inspect weights and follow the resulting ranking. Characters in
the browser world use local rules.

[Open the application](https://juri-halveth.github.io/fortuna/) · [Portfolio](https://juri-halveth.github.io/en/)

The published code includes `docs/rng-lab.mjs` and `docs/rng-panel.mjs` for the
bounded, cancellable local experiment, `docs/collective.mjs` for option comparison,
`docs/curiosity.mjs` for local character behaviour, the interface and model tests.

```sh
node --test docs/*.test.mjs
python -c "import http.server, os; os.chdir('docs'); http.server.SimpleHTTPRequestHandler.extensions_map['.mjs']='text/javascript'; http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler,port=8849,bind='127.0.0.1')"
```

Open `http://127.0.0.1:8849/`. This repository publishes the browser version.
The previously described local Windows tool has neither native source nor an
EXE download here. Draws are samples from an owned Bernoulli model, not measured
improvements in external winning probabilities. Option rankings reflect supplied
inputs; the character profiles share one local rule engine.

Project lead: Juri / HALVETH. AI-assisted development.
An overall project licence has not been granted; [component notices](docs/NOTICE.md)
retain their own terms. Contact: security@halveth.de.
