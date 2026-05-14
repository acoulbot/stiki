"use client";

interface DeviceAnimationProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function DeviceAnimation({
  src,
  alt = "Device animation",
  className = "",
  width,
  height,
}: DeviceAnimationProps) {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      aria-label={alt}
      className={className}
      width={width}
      height={height}
    >
      <source src={src} type="video/webm" />
    </video>
  );
}
