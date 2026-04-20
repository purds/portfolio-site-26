export interface MagneticConfig {
  strength: number;    // 0-1, how much the element moves
  radius: number;      // px, activation distance
  tiltDeg?: number;    // max tilt in degrees (for 3D perspective)
}

export function getMagneticOffset(
  mouseX: number,
  mouseY: number,
  rect: DOMRect,
  config: MagneticConfig
): { x: number; y: number; tiltX: number; tiltY: number; distance: number } {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > config.radius) {
    return { x: 0, y: 0, tiltX: 0, tiltY: 0, distance };
  }

  const factor = (1 - distance / config.radius) * config.strength;
  const maxTilt = config.tiltDeg ?? 0;

  return {
    x: dx * factor,
    y: dy * factor,
    tiltX: -(dy / config.radius) * maxTilt * factor,
    tiltY: (dx / config.radius) * maxTilt * factor,
    distance,
  };
}
