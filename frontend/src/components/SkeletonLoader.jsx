import React from 'react';

function SkeletonBox({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
}

export default function SkeletonLoader() {
  return (
    <div className="skeleton-layout" role="status" aria-label="Caricamento dati meteo...">
      {/* Left panel skeleton */}
      <div className="skeleton-panel">
        <SkeletonBox height={14} width="60%" radius={999} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 14, borderTop: i > 1 ? '1px solid rgba(255,255,255,0.06)' : undefined }}>
            <SkeletonBox width={38} height={38} radius={8} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SkeletonBox height={10} width="45%" radius={999} />
              <SkeletonBox height={16} width="60%" radius={999} />
            </div>
          </div>
        ))}
      </div>

      {/* Center panel skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Main weather card */}
        <div className="skeleton-panel" style={{ alignItems: 'center', padding: '36px 28px 28px' }}>
          <SkeletonBox height={20} width="55%" radius={999} style={{ marginBottom: 12 }} />
          <SkeletonBox width={80} height={80} radius={999} style={{ marginBottom: 16 }} />
          <SkeletonBox height={80} width="40%" radius={16} style={{ marginBottom: 8 }} />
          <SkeletonBox height={18} width="50%" radius={999} style={{ marginBottom: 28 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, width: '100%' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-panel" style={{ padding: 14, alignItems: 'center', gap: 8 }}>
                <SkeletonBox width={24} height={24} radius={999} />
                <SkeletonBox height={10} width="70%" radius={999} />
                <SkeletonBox height={16} width="50%" radius={999} />
              </div>
            ))}
          </div>
        </div>

        {/* Forecast strip skeleton */}
        <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="skeleton-panel" style={{ minWidth: 92, padding: 14, alignItems: 'center', gap: 8 }}>
              <SkeletonBox height={10} width="60%" radius={999} />
              <SkeletonBox width={32} height={32} radius={999} />
              <SkeletonBox height={16} width="50%" radius={999} />
              <SkeletonBox height={12} width="40%" radius={999} />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="skeleton-panel">
          <SkeletonBox height={12} width="30%" radius={999} style={{ marginBottom: 16 }} />
          <SkeletonBox height={180} radius={12} />
        </div>
      </div>

      {/* Right panel skeleton */}
      <div className="skeleton-panel">
        <SkeletonBox height={14} width="60%" radius={999} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 14, borderTop: i > 1 ? '1px solid rgba(255,255,255,0.06)' : undefined }}>
            <SkeletonBox width={38} height={38} radius={8} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SkeletonBox height={10} width="40%" radius={999} />
              <SkeletonBox height={16} width="55%" radius={999} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 20 }}>
          <SkeletonBox height={12} width="40%" radius={999} style={{ marginBottom: 12 }} />
          <SkeletonBox height={200} radius={12} />
        </div>
      </div>
    </div>
  );
}
