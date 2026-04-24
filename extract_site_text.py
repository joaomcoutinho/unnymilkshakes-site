import argparse
import re
import sys
import textwrap
from collections import deque
from urllib.parse import urljoin, urldefrag, urlparse

import requests
from bs4 import BeautifulSoup


SKIP_PATH_PREFIXES = (
    "/wp-admin",
    "/wp-json",
    "/xmlrpc.php",
)

SKIP_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".ico",
    ".pdf",
    ".zip",
    ".rar",
    ".7z",
    ".mp4",
    ".webm",
    ".mp3",
    ".css",
    ".js",
)


def _normalize_url(url: str) -> str:
    url, _frag = urldefrag(url)
    # remove trailing slash except for root
    if url.endswith("/") and urlparse(url).path not in ("", "/"):
        url = url[:-1]
    return url


def _is_same_site(url: str, base_netloc: str) -> bool:
    p = urlparse(url)
    if p.scheme not in ("http", "https"):
        return False
    if p.netloc and p.netloc != base_netloc:
        return False
    path = p.path or "/"
    if any(path.startswith(pref) for pref in SKIP_PATH_PREFIXES):
        return False
    if any(path.lower().endswith(ext) for ext in SKIP_EXTENSIONS):
        return False
    return True


def _visible_text(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")

    for tag in soup(["script", "style", "noscript", "template"]):
        tag.decompose()

    # Prefer the main content; fallback to body.
    root = soup.find("main") or soup.body or soup

    # Get text with line breaks and normalize.
    text = root.get_text("\n", strip=True)
    # Strip common WordPress shortcodes that often leak as literal text.
    # Examples: [rev_slider alias="home"], [info_circle_item ...]...[/info_circle_item]
    text = re.sub(r"\[(?:/?[A-Za-z_][^\]]*)\]", " ", text)
    lines = [re.sub(r"\s+", " ", ln).strip() for ln in text.splitlines()]
    lines = [ln for ln in lines if ln]

    # Collapse excessive blank lines by ensuring single spacing between blocks.
    return "\n".join(lines).strip()


def _extract_links(html: str, url: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    links: list[str] = []
    for a in soup.select("a[href]"):
        href = a.get("href")
        if not href:
            continue
        abs_url = urljoin(url, href)
        links.append(_normalize_url(abs_url))
    return links


def crawl_and_extract(
    start_url: str,
    max_pages: int,
    timeout_s: int,
    user_agent: str,
) -> list[tuple[str, str]]:
    start_url = _normalize_url(start_url)
    base = urlparse(start_url)
    if not base.netloc:
        raise ValueError(f"Invalid start URL: {start_url}")

    session = requests.Session()
    session.headers.update({"User-Agent": user_agent})

    q: deque[str] = deque([start_url])
    seen: set[str] = set()
    results: list[tuple[str, str]] = []

    while q and len(results) < max_pages:
        url = q.popleft()
        url = _normalize_url(url)
        if url in seen:
            continue
        seen.add(url)
        if not _is_same_site(url, base.netloc):
            continue

        resp = session.get(url, timeout=timeout_s, allow_redirects=True)
        resp.raise_for_status()
        ctype = (resp.headers.get("content-type") or "").lower()
        if "text/html" not in ctype:
            continue

        html = resp.text
        text = _visible_text(html)
        if text:
            results.append((url, text))

        for link in _extract_links(html, resp.url):
            if _is_same_site(link, base.netloc) and link not in seen:
                q.append(link)

    return results


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Crawl a site and extract visible textual content."
    )
    ap.add_argument(
        "--start-url",
        default="https://unnymilkshakes.com.br/",
        help="Initial URL to start crawling from.",
    )
    ap.add_argument(
        "--max-pages",
        type=int,
        default=25,
        help="Maximum number of HTML pages to fetch.",
    )
    ap.add_argument(
        "--timeout-s",
        type=int,
        default=25,
        help="Per-request timeout in seconds.",
    )
    ap.add_argument(
        "--user-agent",
        default="TextExtractorBot/1.0 (+https://example.invalid)",
        help="User-Agent header to send.",
    )
    ap.add_argument(
        "--out",
        default="unnymilkshakes.com.br.text.md",
        help="Output file path.",
    )
    args = ap.parse_args()

    try:
        pages = crawl_and_extract(
            start_url=args.start_url,
            max_pages=args.max_pages,
            timeout_s=args.timeout_s,
            user_agent=args.user_agent,
        )
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    pages.sort(key=lambda x: x[0])

    header = textwrap.dedent(
        f"""\
        # Extração de conteúdo textual

        - Site: {args.start_url}
        - Páginas extraídas: {len(pages)}
        - Critério: texto visível (sem scripts/estilos), consolidado por URL
        """
    ).strip()

    with open(args.out, "w", encoding="utf-8") as f:
        f.write(header + "\n\n")
        for url, text in pages:
            f.write(f"## {url}\n\n")
            f.write(text)
            f.write("\n\n---\n\n")

    print(f"Wrote: {args.out} ({len(pages)} pages)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

