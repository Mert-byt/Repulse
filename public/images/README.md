# Görsel Dosyaları

Bu klasöre aşağıdaki dosyaları ekleyin:

## repulse-logo.png
- Repulse logosu (GR/QR stilinde geometrik logo)
- Önerilen boyut: 200x200px veya daha yüksek (transparent PNG)
- Dosya yolu: `/public/images/repulse-logo.png`
- Logo site renk paletine uyumlu olacak şekilde filtrelerle işlenecektir

## tree-spruce.png
- Ladin ağacı görseli (spruce tree)
- Önerilen boyut: 800x1200px veya daha yüksek (transparent PNG)
- Dosya yolu: `/public/images/tree-spruce.png`
- Ağaç rüzgar animasyonu ile sürekli sallanacak

## favicon.png
- Favicon (tarayıcı sekmesindeki küçük ikon)
- Önerilen boyut: 32x32px veya 64x64px (PNG formatı)
- Dosya yolu: `/public/images/favicon.png`
- Logo görselinden oluşturulabilir (küçük boyutlu versiyonu)

## Logo Fallback
Logo yüklenemezse SVG fallback otomatik olarak gösterilecektir.

## Favicon Oluşturma
Favicon oluşturmak için:
- Logo görselini küçültün (32x32 veya 64x64)
- Online araçlar: favicon.io, realfavicongenerator.net
- Veya ImageMagick: `convert repulse-logo.png -resize 32x32 favicon.png`
