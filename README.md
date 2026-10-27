# cv-site

Situs CV Ahmad Habibul Ulum — `https://cv.88apps.dev`.

Halaman statis: satu `index.html` + aset di `assets/` (PDF CV, preview WebP,
CSS/JS viewer), dilayani nginx di dalam container. Tidak ada proses build
frontend, tidak ada database.

## Isi

| Path | Keterangan |
| --- | --- |
| `index.html` | Halaman utama (preview + tombol buka/download PDF) |
| `assets/cv-ahmad-habibul-ulum.pdf` | Berkas CV yang diunduh pengunjung |
| `assets/cv-preview*.webp` | Render halaman 1 PDF (800w / 1200w / 1697w) |
| `assets/viewer.css`, `assets/viewer.js` | Gaya + zoom preview |
| `nginx.conf` | Konfigurasi nginx (cache, header, `/health`) |
| `Dockerfile` | `nginx:1.27-alpine` + `curl` untuk healthcheck Coolify |

## Memperbarui CV

1. Ganti `assets/cv-ahmad-habibul-ulum.pdf` dengan PDF baru (1 halaman, A4).
2. Render ulang preview (butuh `pymupdf` + `pillow`):

```bash
python3 - <<'PY'
import pymupdf, io
from PIL import Image
src = "assets/cv-ahmad-habibul-ulum.pdf"
page = pymupdf.open(src)[0]
zoom = 1697 / page.rect.width
img = Image.open(io.BytesIO(page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom)).tobytes("png"))).convert("RGB")
for name, w, q in [("cv-preview.webp", 1697, 82), ("cv-preview-medium.webp", 1200, 82), ("cv-preview-small.webp", 800, 80)]:
    im = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
    im.save(f"assets/{name}", "WEBP", quality=q, method=6)
PY
```

3. Sesuaikan ukuran berkas di `index.html` (`<span class="file-size">/ 167 KB</span>`)
   dan atribut `height` gambar preview bila rasio halaman berubah.
4. Build + push image, lalu deploy:

```bash
SHA=$(git rev-parse --short HEAD)
sudo docker build -t ghcr.io/real-habibul/cv-site:sha-$SHA -t ghcr.io/real-habibul/cv-site:latest .
sudo docker push ghcr.io/real-habibul/cv-site:sha-$SHA
sudo docker push ghcr.io/real-habibul/cv-site:latest
```

Lalu di Coolify: `PATCH /api/v1/applications/<uuid> {"docker_registry_image_tag":"sha-<commit>"}`
→ `POST /api/v1/deploy {"uuid":"<uuid>"}`.

## Deploy saat ini

- Coolify: app `cv-site`, server `localhost` (VPS 15.232.185.209), port container 80.
- Domain: `cv.88apps.dev` (Cloudflare proxied) → A `15.232.185.209`.
- Tag produksi dipin ke `sha-<commit>`, bukan `latest`.
