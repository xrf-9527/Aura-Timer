import { useBackgroundRotation } from '../hooks/useBackgroundRotation';

export interface BackgroundLayerProps {
  /** 图片切换间隔时间（毫秒），默认 5 分钟 */
  interval?: number;
  /** 是否启用自动轮换，默认 true */
  enabled?: boolean;
}

/**
 * 背景图片层组件
 *
 * 特性：
 * - 自动轮换护眼高清背景图片
 * - 平滑的淡入淡出过渡效果
 * - 固定定位，覆盖整个视口
 * - 使用自然风景图片（绿色、蓝色主题）
 *
 * @example
 * ```tsx
 * <BackgroundLayer interval={5 * 60 * 1000} enabled={true} />
 * ```
 */
export function BackgroundLayer({ interval, enabled = true }: BackgroundLayerProps) {
  const { backgroundUrl, opacity, transitionDuration } = useBackgroundRotation({
    interval,
    enabled,
  });

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" role="presentation" aria-hidden="true">
      {/* 背景图层 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${backgroundUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          opacity,
          transition: `opacity ${transitionDuration}s ease-in-out`,
        }}
      />
      {/* 暗色柔化层 — Apple 风格 ~25% 暗化 */}
      <div className="absolute inset-0 bg-black/25" />
      {/* 渐晕效果 — 边缘加深，引导视线到中心 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
}
