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
 */
export function BackgroundLayer({ interval, enabled = true }: BackgroundLayerProps) {
  const { backgroundUrl, opacity, transitionDuration } = useBackgroundRotation({
    interval,
    enabled,
  });

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: `url('${backgroundUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        opacity,
        transition: `opacity ${transitionDuration}s ease-in-out`,
      }}
    />
  );
}
