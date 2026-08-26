import math
import os
import struct
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "icons")
os.makedirs(OUT, exist_ok=True)


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png(path: str, size: int, rgba: list[list[int]]) -> None:
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            raw.extend(rgba[y * size + x])
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as handle:
        handle.write(png)


def mix(a, b, t):
    return [int(a[i] * (1 - t) + b[i] * t) for i in range(4)]


def dist_round_rect(px, py, x0, y0, x1, y1, r):
    cx = min(max(px, x0 + r), x1 - r)
    cy = min(max(py, y0 + r), y1 - r)
    if x0 + r <= px <= x1 - r or y0 + r <= py <= y1 - r:
        dx = 0 if x0 <= px <= x1 else min(abs(px - x0), abs(px - x1))
        dy = 0 if y0 <= py <= y1 else min(abs(py - y0), abs(py - y1))
        return -1 if x0 <= px <= x1 and y0 <= py <= y1 else math.hypot(dx, dy)
    return math.hypot(px - cx, py - cy) - r


def line_dist(px, py, x0, y0, x1, y1):
    dx, dy = x1 - x0, y1 - y0
    if dx == 0 and dy == 0:
        return math.hypot(px - x0, py - y0)
    t = max(0, min(1, ((px - x0) * dx + (py - y0) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (x0 + t * dx), py - (y0 + t * dy))


def render(size: int) -> list[list[int]]:
    bg = [37, 99, 235, 255]
    white = [255, 255, 255, 255]
    slash = [254, 242, 242, 255]
    transparent = [0, 0, 0, 0]
    pixels = []
    s = float(size)

    for y in range(size):
        for x in range(size):
            px, py = x + 0.5, y + 0.5
            d_bg = dist_round_rect(px, py, s * 0.06, s * 0.06, s * 0.94, s * 0.94, s * 0.22)
            color = transparent[:]
            if d_bg < 1.2:
                t = max(0, min(1, 0.5 - d_bg))
                color = mix(transparent, bg, t if d_bg > 0 else 1)

            d_card = dist_round_rect(px, py, s * 0.28, s * 0.22, s * 0.72, s * 0.78, s * 0.07)
            if d_card < 1:
                t = max(0, min(1, 0.5 - d_card))
                color = mix(color, white, t if d_card > 0 else 1)

            for i, yy in enumerate((0.34, 0.48, 0.62)):
                width = s * (0.28 if i != 1 else 0.22)
                d_bar = dist_round_rect(
                    px,
                    py,
                    s * 0.36,
                    s * yy,
                    s * 0.36 + width,
                    s * yy + s * 0.055,
                    s * 0.02,
                )
                if d_bar < 1:
                    t = max(0, min(1, 0.5 - d_bar))
                    color = mix(color, bg, t if d_bar > 0 else 0.95)

            d_slash = line_dist(px, py, s * 0.22, s * 0.78, s * 0.78, s * 0.22)
            if d_slash < s * 0.07:
                t = max(0, min(1, (s * 0.07 - d_slash) / (s * 0.04)))
                color = mix(color, [220, 38, 38, 255], t)
            elif d_slash < s * 0.095:
                t = (s * 0.095 - d_slash) / (s * 0.025)
                color = mix(color, slash, t * 0.9)

            pixels.append(color)
    return pixels


for size in (16, 32, 48, 128):
    write_png(os.path.join(OUT, f"icon{size}.png"), size, render(size))
    print("wrote", size)
