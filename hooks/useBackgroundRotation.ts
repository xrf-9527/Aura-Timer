import { useState, useEffect, useCallback } from 'react';

// 精选护眼高清背景图片集合（使用 Unsplash 的自然风景主题）
// 这些图片都是柔和的自然色调，对眼睛友好
const BACKGROUND_IMAGES = [
  // 绿色森林和自然景观（护眼效果最佳）
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80', // 森林
  'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&q=80', // 绿色山脉
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', // 山景

  // 蓝天和海洋（舒缓视觉）
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80', // 湖泊
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80', // 日落山景
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&q=80', // 田野

  // 柔和的自然光线
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80', // 雾气森林
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80', // 山峰
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920&q=80', // 樱花树

  // 宁静的水景
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80', // 湖边
  'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1920&q=80', // 森林湖
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80', // 雪山
];

export interface BackgroundRotationOptions {
  /** 图片切换间隔时间（毫秒），默认 5 分钟 */
  interval?: number;
  /** 是否启用自动轮换，默认 true */
  enabled?: boolean;
  /** 淡入淡出过渡时间（毫秒），默认 2 秒 */
  transitionDuration?: number;
}

/**
 * 背景图片轮换 Hook
 *
 * 功能特性：
 * - 定时自动切换背景图片
 * - 平滑的淡入淡出过渡效果
 * - 图片预加载，确保流畅切换
 * - 使用护眼的高清自然风景图片
 *
 * @param options 配置选项
 * @returns 当前背景图片 URL 和不透明度
 */
export function useBackgroundRotation(options: BackgroundRotationOptions = {}) {
  const {
    interval = 5 * 60 * 1000, // 默认 5 分钟
    enabled = true,
    transitionDuration = 2000, // 默认 2 秒过渡
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 预加载下一张图片
  const preloadImage = useCallback((index: number) => {
    const img = new Image();
    img.src = BACKGROUND_IMAGES[index];
  }, []);

  // 切换到下一张背景图片
  const switchToNext = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    // 淡出当前图片
    setOpacity(0);

    setTimeout(() => {
      // 切换到下一张
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % BACKGROUND_IMAGES.length;
        // 预加载再下一张
        preloadImage((nextIndex + 1) % BACKGROUND_IMAGES.length);
        return nextIndex;
      });

      // 淡入新图片
      setTimeout(() => {
        setOpacity(1);
        setIsTransitioning(false);
      }, 50);
    }, transitionDuration);
  }, [isTransitioning, preloadImage, transitionDuration]);

  // 设置定时轮换
  useEffect(() => {
    if (!enabled) return;

    // 预加载第一张和第二张图片
    preloadImage(0);
    preloadImage(1);

    const timer = setInterval(switchToNext, interval);

    return () => clearInterval(timer);
  }, [enabled, interval, switchToNext, preloadImage]);

  return {
    backgroundUrl: BACKGROUND_IMAGES[currentIndex],
    opacity,
    transitionDuration: transitionDuration / 1000, // 转换为秒
    switchToNext, // 暴露手动切换方法
  };
}
