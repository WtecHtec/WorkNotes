// src/components/ZoomableContainer.jsx
import React, { useEffect, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface IZoomableContainer {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  align?: "left" | "center";
  background?: string;
  scaleMode?: "auto" | "width" | "height";
}

export default function ZoomableContainer({
  children,
  minScale = 0.01,
  maxScale = 3,
  align = "center", // "left" | "center"
  background = "#ffffff",
  scaleMode = "auto",
}: IZoomableContainer) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const transformInstanceRef = useRef(null);

  const [_, setReady] = useState(false);
  const lastCalcRef = useRef({ scale: 1, x: 0, y: 0 });

  // 动态计算缩放与偏移
  const computeAndApply = (animate = false) => {
    const wrapper = containerRef.current as any;
    const content = contentRef.current as any;
    const instance = transformInstanceRef.current as any;
    if (!wrapper || !content) return;

    const cw = wrapper.clientWidth;
    const ch = wrapper.clientHeight;
    const tw = content.scrollWidth;
    const th = content.scrollHeight;

    console.log("cw----", cw);

    const scaleW = cw / tw;
    const scaleH = ch / th;
    let scale = Math.min(scaleW, scaleH, 1);
    if (scaleMode === "height") {
      scale = scaleH;
    } else if (scaleMode === "width") {
      scale = scaleW;
    }
    let x = 0;
    let y = 0;
    if (align === "center") {
      x = (cw - tw * scale) / 2;
      y = (ch - th * scale) / 2;
    }
    // else {
    //   if (tw * scale < cw) x = (cw - tw * scale) / 2;
    //   if (th * scale < ch) y = (ch - th * scale) / 2;
    // }

    lastCalcRef.current = { scale, x, y };
    if (instance) {
      instance.setTransform(x, y, scale, animate ? 200 : 0);
    }
    setReady(true);
  };

  // TransformWrapper 初始化回调：保存实例并应用上次计算的 transform（首次应用）
  const handleInit = (instance: any) => {
    transformInstanceRef.current = instance;
    const last = lastCalcRef.current || { x: 0, y: 0, scale: 1 };
    if (instance && typeof instance.setTransform === "function") {
      instance.setTransform(last.x, last.y, last.scale, 0);
    }
    setReady(true);
  };

  // 初始化监听器
  useEffect(() => {
    const ro = new ResizeObserver(() => computeAndApply(true));
    if (containerRef.current) ro.observe(containerRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    setTimeout(() => computeAndApply(false), 50);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background,
        touchAction: "none",
        position: "relative",
      }}
    >
      <TransformWrapper
        minScale={minScale}
        maxScale={maxScale}
        doubleClick={{ mode: "reset" }}
        pinch={{ step: 0.05 }}
        wheel={{ step: 0.1 }}
        centerZoomedOut={false}
        limitToBounds={true}
        onInit={handleInit}
      >
        <TransformComponent
          wrapperStyle={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
          contentStyle={{ display: "inline-block" }}
        >
          <div ref={contentRef} style={{ display: "inline-block" }}>
            {children}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
