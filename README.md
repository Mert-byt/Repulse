# Repulse

Akıllı GitHub Repository Finder — isim, açıklama, konular ve README içeriğinde **işlevsellik bazlı** arama yapan, salt-okunur ve web tabanlı bir araç.

![Repulse](public/images/favicon.svg)

## Özellikler

- **Akıllı Arama** — Doğal dilde yazılmış cümleleri anlar, Türkçe/İngilizce stop-word'leri temizler ve isim + açıklama + konular + README üzerinde çoklu arama yapar
- **Çoklu Sonuç Kaynağı** — GitHub API üzerinde 3 farklı arama birleştirilir ve tekrarlar temizlenir
- **Sıralama Seçenekleri** — Yıldız, güncellenme tarihi ve fork sayısına göre sıralama
- **Keşif Modu** — Boş arama yaptığınızda popüler repolar otomatik keşfedilir
- **Sonsuz Kaydırma** — Sayfa sonuna gelince otomatik yeni sonuçlar yüklenir
- **Beğenilenler** — localStorage'da saklanır, beğenilerinize göre öneriler üretilir
- **Güvenli** — Salt-okunur, dosya indirmez, çalıştırmaz, kişisel veri toplamaz
- **Klavye Kısayolları** — `Ctrl/⌘ + K` arama kutusuna odaklanır, `Esc` temizler

## Kurulum

```bash
npm install
cp .env.example .env   # GITHUB_TOKEN ekleyin (opsiyonel, hız sınırı için önerilir)
npm start
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışır. Farklı port için:

```bash
PORT=9700 npm start
```

### GITHUB_TOKEN (opsiyonel)
GitHub API'si kimliksiz isteklerde saat başı 60 istek ile sınırlıdır. `GITHUB_TOKEN` eklerseniz limit 5000'e çıkar:
- GitHub → Settings → Developer settings → Personal access tokens → Generate new token
- `repo` (public_repo) kapsamı yeterlidir
- Token'ı `.env` dosyasına ekleyin (asla repo'ya commit etmeyin)

## API

### `GET /api/search`
Arama yapmak için ana uç nokta.

| Parametre | Açıklama | Varsayılan |
|-----------|----------|------------|
| `q` | Arama terimi (zorunlu) | — |
| `sort` | `stars` \| `updated` \| `forks` | `stars` |
| `order` | `desc` \| `asc` | `desc` |
| `page` | Sayfa numarası | `1` |

```bash
curl "http://localhost:3000/api/search?q=machine+learning&sort=stars"
```

### `POST /api/search`
Geriye dönük uyumluluk için (JSON gövde: `{ query, sort, order }`).

## Proje Yapısı

```
├── server.js              # Express sunucusu + API
├── src/finder.js          # GitHub arama mantığı (Octokit)
├── bin/github-search      # CLI aracı
├── test/finder.test.js    # Unit testler
└── public/                # Statik site (HTML/CSS/JS)
    ├── index.html
    ├── css/               # style.css, filter.css
    ├── js/                # main.js + vendor/motion.min.js (framer-motion)
    └── images/            # favicon.svg
```

## Test

```bash
npm test
```

## Lisans

ISC — bkz. [LICENSE](LICENSE)
