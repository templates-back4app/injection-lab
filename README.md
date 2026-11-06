# injection-lab

[![Deploy on Back4app](https://img.shields.io/badge/Deploy%20on-Back4app-1568B8?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJMMiA3djEwbDEwIDUgMTAtNVY3eiIvPjwvc3ZnPg==)](https://www.back4app.com/signup?utm_source=github&utm_medium=repo&utm_campaign=injection-lab)

A comment that is markup, stored in a backend and then rendered by a page that
is opened in **a real browser**. Whether it ran is read back out of the DOM,
not assumed.

**Measured on Parse Server 7.4.0 with MongoDB 7, Docker 29.4.3 and headless
Chrome, 29 October 2026. Identical across two consecutive clean runs.**

> **Read the article:** [A Comment Became Code: Stored XSS in an AI-Built App, in a Real Browser](https://www.back4app.com/blog/stored-xss-in-ai-built-apps?utm_source=github&utm_medium=repo&utm_campaign=injection-lab)

## Run it

```
./run.sh
```

Needs Docker, Node 22 and Google Chrome.

## What it found

```
the backend accepted the comment:             yes
after the page rendered it:                   session token taken: r:a-real-looking-session-token
the same comment in the text-rendered list:   shown as the characters the person typed
```

The payload is an image tag whose source does not load, plus the error handler
every image tag already has. No exploit kit is involved.

```
the same comment, posted again:               refused — comments are text, not markup
an ordinary comment with a < in it:           accepted
```

The guard on the way in refuses markup and leaves `nice one, 3 < 5 though`
alone, which is the difference between validating and breaking your own product.

## Two things that cost an afternoon each

`--headless` hangs on `--dump-dom` with this Chrome; `--headless=new` does not.

And the browser must be launched **asynchronously**. `execSync` blocks the Node
event loop — and in this lab that same process is the web server Chrome is
trying to read from, so the two deadlock and the run times out with no result.

## The pieces

| file | what it does |
| --- | --- |
| `page/index.html` | the comment list, rendered twice: as generated, and as text |
| `run.mjs` | stores the comment, opens the page in Chrome, reads the DOM back |
| `guarded.mjs` | the same comment against a backend that validates on the way in |
| `cloud/main.js` | the `beforeSave` guard, switched by an environment variable |
