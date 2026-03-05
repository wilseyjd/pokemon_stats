"""
JEF-89: Batch update pokemon_data.pkl Image column with PokeAPI sprite URLs.

Replaces hotlinked pokemondb.net URLs with official artwork from the PokeAPI CDN.

Usage:
    python scripts/update_pokemon_images.py [--dry-run] [--limit N]

Options:
    --dry-run   Print planned changes without modifying the pickle file.
    --limit N   Only process the first N Pokemon (useful for testing).
"""

import argparse
import pickle
import re
import time
import unicodedata
from pathlib import Path

import requests

# Pokemon whose default PokeAPI slug differs from what name_to_slug produces.
# Keys are the exact names in our DataFrame.
SLUG_OVERRIDES = {
    "Basculin": "basculin-red-striped",
    "Frillish": "frillish-male",
    "Jellicent": "jellicent-male",
    "Pyroar": "pyroar-male",
    "Meowstic": "meowstic-male",
    "Zygarde": "zygarde-50",
}

PICKLE_PATH = Path(__file__).parent.parent / "pokemon_data.pkl"
POKEAPI_BASE = "https://pokeapi.co/api/v2/pokemon"
REQUEST_DELAY = 0.2  # seconds between API calls to be a good citizen


def name_to_slug(name: str) -> str:
    """
    Convert a Pokemon name from our DataFrame into a PokeAPI slug.

    Examples:
        "Bulbasaur"             -> "bulbasaur"
        "Mega Venusaur"         -> "venusaur-mega"
        "Mega Charizard X"      -> "charizard-mega-x"
        "Mr. Mime"              -> "mr-mime"
        "Ho-oh"                 -> "ho-oh"
        "Deoxys- Normal Forme"  -> "deoxys-normal"
        "Heat Rotom"            -> "rotom-heat"
        "White Kyurem"          -> "kyurem-white"
    """
    s = name.strip()

    # "Mega {Base}" or "Mega {Base} X/Y"
    m = re.match(r"^Mega (.+?)( [XY])?$", s)
    if m:
        base = re.sub(r"[.\s]+", "-", m.group(1).lower()).strip("-")
        suffix = ("-" + m.group(2).strip().lower()) if m.group(2) else ""
        return f"{base}-mega{suffix}"

    # "White/Black Kyurem"
    m = re.match(r"^(White|Black) Kyurem$", s)
    if m:
        return f"kyurem-{m.group(1).lower()}"

    # "{Adj} Rotom" (Heat, Wash, Frost, Fan, Mow)
    m = re.match(r"^(Heat|Wash|Frost|Fan|Mow) Rotom$", s)
    if m:
        return f"rotom-{m.group(1).lower()}"

    # "{Name}- {Descriptor} {Forme/Mode/Size/Cloak}" -> "{name}-{descriptor}"
    # Handles both "Deoxys- Normal Forme" and "Gourgeist-Super Size"
    m = re.match(r"^(.+?)-\s*(\S+?)(?:\s+(?:Forme|Mode|Size|Cloak))?$", s)
    if m:
        base_raw = m.group(1)
        desc = m.group(2).lower()
        # Only reformat if the base part has no hyphen already (avoid mangling Ho-oh, Porygon-Z)
        if "-" not in base_raw and base_raw.strip():
            base = re.sub(r"[.\s]+", "-", base_raw.lower()).strip("-")
            return f"{base}-{desc}"

    # Nidoran gender symbols
    s = s.replace("\u2640", "-f").replace("\u2642", "-m")

    # Strip accents (e.g., Flabébé -> Flabebe)
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")

    # Default: lowercase, strip periods and apostrophes, spaces to hyphens
    slug = s.lower().replace(".", "").replace("'", "")
    slug = re.sub(r"\s+", "-", slug)
    return slug.strip("-")


def fetch_sprite_url(slug: str) -> str | None:
    """Fetch the official artwork URL for a Pokemon slug. Returns None on failure."""
    try:
        resp = requests.get(f"{POKEAPI_BASE}/{slug}", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            # Prefer high-quality official artwork
            artwork = (
                data.get("sprites", {})
                .get("other", {})
                .get("official-artwork", {})
                .get("front_default")
            )
            if artwork:
                return artwork
            # Fall back to basic front sprite
            return data.get("sprites", {}).get("front_default")
        return None
    except requests.RequestException:
        return None


def main():
    parser = argparse.ArgumentParser(description="Update Pokemon image URLs from PokeAPI.")
    parser.add_argument("--dry-run", action="store_true", help="Print changes without saving.")
    parser.add_argument("--limit", type=int, default=None, help="Only process first N Pokemon.")
    args = parser.parse_args()

    print(f"Loading {PICKLE_PATH}...")
    with open(PICKLE_PATH, "rb") as f:
        df = pickle.load(f)

    rows = df.iterrows()
    total = len(df)
    if args.limit:
        import itertools
        rows = itertools.islice(rows, args.limit)
        total = args.limit

    updated = 0
    failed = []

    for i, (idx, row) in enumerate(rows):
        name = row["Name"]
        slug = SLUG_OVERRIDES.get(name) or name_to_slug(name)
        sprite_url = fetch_sprite_url(slug)

        display_name = name.encode("ascii", "replace").decode("ascii")
        if sprite_url:
            if not args.dry_run:
                df.at[idx, "Image"] = sprite_url
            print(f"[{i+1}/{total}] {display_name!r:35s} -> {slug:40s}  OK")
            updated += 1
        else:
            print(f"[{i+1}/{total}] {display_name!r:35s} -> {slug:40s}  FAILED (keeping original)")
            failed.append((name, slug, row["Image"]))

        time.sleep(REQUEST_DELAY)

    print(f"\n{'DRY RUN — ' if args.dry_run else ''}Results: {updated} updated, {len(failed)} failed")

    if failed:
        print("\nFailed Pokemon (kept original URL):")
        for name, slug, original_url in failed:
            display_name = name.encode("ascii", "replace").decode("ascii")
            print(f"  {display_name!r:35s}  tried slug: {slug!r:35s}  original: {original_url}")

    if not args.dry_run and updated > 0:
        print(f"\nSaving {PICKLE_PATH}...")
        with open(PICKLE_PATH, "wb") as f:
            pickle.dump(df, f)
        print("Done.")


if __name__ == "__main__":
    main()
