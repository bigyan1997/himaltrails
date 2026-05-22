export function Skeleton({ width = '100%', height = '16px', radius = '8px', style = {} }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

export function TrailCardSkeleton() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E5E0', borderRadius: '20px', padding: '36px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <Skeleton width="80px" height="24px" radius="20px" />
            <Skeleton width="72px" height="24px" radius="20px" />
          </div>
          <Skeleton width="70%" height="36px" radius="8px" style={{ marginBottom: '10px' }} />
          <Skeleton width="40%" height="16px" radius="6px" style={{ marginBottom: '28px' }} />
          <div style={{ display: 'flex', gap: '32px' }}>
            <Skeleton width="48px" height="20px" radius="6px" />
            <Skeleton width="60px" height="20px" radius="6px" />
            <Skeleton width="72px" height="20px" radius="6px" />
          </div>
        </div>
        <Skeleton width="130px" height="130px" radius="16px" />
      </div>
      <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="160px" height="14px" radius="6px" />
        <Skeleton width="100px" height="14px" radius="6px" />
      </div>
    </div>
  )
}

export function TrailDetailSkeleton() {
  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh' }}>
      <div style={{ height: '100vh', backgroundColor: '#0D2B1D' }} />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px' }}>
        <Skeleton width="120px" height="12px" radius="6px" style={{ marginBottom: '20px' }} />
        <Skeleton width="60%" height="44px" radius="8px" style={{ marginBottom: '32px' }} />
        <Skeleton width="100%" height="200px" radius="16px" style={{ marginBottom: '24px' }} />
        <Skeleton width="100%" height="120px" radius="16px" />
      </div>
    </div>
  )
}
