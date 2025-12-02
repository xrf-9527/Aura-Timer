import React, { useState, useEffect, useRef } from 'react';
import { Position } from '../types';

interface WidgetSize {
  width: number;
  height: number;
}

export const useDraggable = (
  initialPosition: Position,
  widgetSize: WidgetSize = { width: 340, height: 200 }
) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const prevAspectRatio = useRef(typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 1);

  // React 19.2 best practice: plain functions for event handlers
  // No need for useCallback unless passing to memo-wrapped components
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging if interacting with inputs or buttons
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }

    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent dragging if interacting with inputs or buttons
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }

    const touch = e.touches[0];
    setIsDragging(true);
    setOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  // React 19.2 best practice: Move event listeners inside useEffect
  // Reference: https://react.dev/reference/react/useCallback
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - offset.x,
        y: touch.clientY - offset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, offset.x, offset.y]); // Only primitive dependencies

  // Auto-center on screen rotation (progressive enhancement approach)
  useEffect(() => {
    const recenterWidget = () => {
      const centerX = (window.innerWidth - widgetSize.width) / 2;
      const centerY = (window.innerHeight - widgetSize.height) / 2;
      setPosition({ x: centerX, y: centerY });
    };

    // Strategy 1: Screen Orientation API (modern, best performance)
    // Only triggers on actual device rotation, no debounce needed
    if (screen?.orientation) {
      const handleOrientationChange = () => {
        recenterWidget();
        prevAspectRatio.current = window.innerWidth / window.innerHeight;
      };

      screen.orientation.addEventListener('change', handleOrientationChange);
      return () => {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      };
    }

    // Strategy 2: matchMedia (fallback for older devices)
    // More precise than resize, monitors CSS orientation media query
    const portraitQuery = window.matchMedia('(orientation: portrait)');
    if (portraitQuery?.addEventListener) {
      const handleMediaChange = () => {
        recenterWidget();
        prevAspectRatio.current = window.innerWidth / window.innerHeight;
      };

      portraitQuery.addEventListener('change', handleMediaChange);
      return () => {
        portraitQuery.removeEventListener('change', handleMediaChange);
      };
    }

    // Strategy 3: resize + aspect ratio (universal fallback)
    // Debounced for performance, detects significant aspect ratio changes
    let resizeTimer: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      const currentAspectRatio = window.innerWidth / window.innerHeight;
      const aspectRatioChanged = Math.abs(currentAspectRatio - prevAspectRatio.current) > 0.1;

      if (aspectRatioChanged) {
        recenterWidget();
        prevAspectRatio.current = currentAspectRatio;
      }
    };

    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, [widgetSize.width, widgetSize.height]);

  return { position, handleMouseDown, handleTouchStart, isDragging };
};
