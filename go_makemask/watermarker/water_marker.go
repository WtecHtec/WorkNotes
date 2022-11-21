package watermarker

import (
	"fmt"

	"github.com/fogleman/gg"
)

func MakeWaterMarker(imgPath string, waterDesc string, outPath string) bool {
	im, err := gg.LoadImage(imgPath)
	if err != nil {
		return false
	}
	w := im.Bounds().Size().X
	h := im.Bounds().Size().Y
	fmt.Print(w, h)
	dc := gg.NewContext(w, h)
	rd := w / 375
	if rd == 0 {
		rd = 1
	}
	if err := dc.LoadFontFace("./font.ttf", float64(rd*24)); err != nil {
		fmt.Print(err)
		return false
	}
	dc.DrawImage(im, 0, 0)
	sw, sh := dc.MeasureString(waterDesc)
	dc.SetRGBA(99, 99, 99, 0.6)
	for j := 0; j < h; j += (int(sh + float64(30*rd))) {
		for i := 0; i < w; i += (int(sw + float64(24*rd))) {
			dc.Push()
			dc.DrawString(waterDesc, float64(i), float64(j))
			dc.Pop()
		}
	}
	dc.SavePNG(outPath)
	return true
}
