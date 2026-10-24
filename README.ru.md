[Deutsch](README.md) · [English](README.en.md) · [Русский](README.ru.md)

# Fortuna · Сравнение вариантов в браузере

**Браузерный интерфейс и локальные модели JavaScript.** Введите варианты,
посмотрите веса и полученную последовательность оценок. Персонажи работают
по локальным правилам.

[Открыть приложение](https://juri-halveth.github.io/fortuna/) · [Портфолио](https://juri-halveth.github.io/ru/)

В опубликованных исходниках: `docs/collective.mjs` для сравнения вариантов,
`docs/curiosity.mjs` для поведения персонажей, интерфейс и тесты моделей.

```sh
node --test docs/*.test.mjs
python -c "import http.server, os; os.chdir('docs'); http.server.SimpleHTTPRequestHandler.extensions_map['.mjs']='text/javascript'; http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler,port=8849,bind='127.0.0.1')"
```

Откройте `http://127.0.0.1:8849/`. Здесь опубликована браузерная версия.
Ранее описанный локальный инструмент Windows не имеет здесь нативных исходников
или EXE-файла. Оценки следуют введённым данным и не подтверждают повышение
шансов выигрыша. Все профили используют одну локальную систему правил.

Руководитель: Юри / HALVETH. Разработка с помощью ИИ.
Общая лицензия проекта ещё не предоставлена; [условия компонентов](docs/NOTICE.md)
сохраняют силу. Контакт: security@halveth.de.
