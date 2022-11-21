package main

import (
	"fmt"
	"mask/watermarker"
)

func main() {
	fmt.Print("开始")
	imgPtah := "./test.jpg"
	desc := "测试"
	outPath := "./test-water.jpg"
	watermarker.MakeWaterMarker(imgPtah, desc, outPath)
}
