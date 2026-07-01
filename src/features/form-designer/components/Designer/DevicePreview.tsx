import { useState } from 'react';
import { useDesignerStore } from '../../store/designerStore';
import { FormRenderer } from '../../renderer/FormRenderer';

type Device = 'mobile' | 'tablet' | 'desktop' | 'full';
type Orientation = 'portrait' | 'landscape';
type DesktopSize = 'narrow' | 'standard' | 'wide';

const DESKTOP_SIZES: { id: DesktopSize; label: string; width: number; height: number }[] = [
  { id: 'narrow',   label: 'Narrow',   width: 1024, height: 768 },
  { id: 'standard', label: 'Standard', width: 1280, height: 800 },
  { id: 'wide',     label: 'Wide',     width: 1920, height: 1080 },
];

interface DeviceConfig {
  id: Device;
  label: string;
  icon: string;
  portraitWidth: number;
  portraitHeight: number;
  hasOrientation: boolean;
  frameClass: string;
}

const DEVICES: DeviceConfig[] = [
  {
    id: 'mobile',
    label: 'Mobile',
    icon: '📱',
    portraitWidth: 390,
    portraitHeight: 844,
    hasOrientation: true,
    frameClass: 'border-[10px] border-gray-800 shadow-2xl',
  },
  {
    id: 'tablet',
    label: 'Tablet',
    icon: '⬜',
    portraitWidth: 768,
    portraitHeight: 1024,
    hasOrientation: true,
    frameClass: 'border-[10px] border-gray-800 shadow-2xl',
  },
  {
    id: 'desktop',
    label: 'Desktop',
    icon: '🖥',
    portraitWidth: 1280,
    portraitHeight: 800,
    hasOrientation: false,
    frameClass: 'rounded-lg border-[10px] border-gray-800 shadow-2xl',
  },
  {
    id: 'full',
    label: 'Full',
    icon: '⛶',
    portraitWidth: 0,
    portraitHeight: 0,
    hasOrientation: false,
    frameClass: '',
  },
];

export function DevicePreview() {
  const { schema } = useDesignerStore();
  const [device, setDevice] = useState<Device>('desktop');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [desktopSize, setDesktopSize] = useState<DesktopSize>('standard');

  const config = DEVICES.find(d => d.id === device)!;
  const isLandscape = orientation === 'landscape' && config.hasOrientation;

  const activeDesktop = DESKTOP_SIZES.find(s => s.id === desktopSize)!;
  const baseW = device === 'desktop' ? activeDesktop.width : config.portraitWidth;
  const baseH = device === 'desktop' ? activeDesktop.height : config.portraitHeight;

  const frameW = isLandscape ? baseH : baseW;
  const frameH = isLandscape ? baseW : baseH;

  const canRotate = config.hasOrientation;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100">
      {/* Top bar */}
      <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4 gap-4 shrink-0 shadow-sm">
        <span className="text-sm font-semibold text-gray-700 mr-2">Preview: {schema.title}</span>

        {/* Device switcher */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {DEVICES.map(d => (
            <button
              key={d.id}
              onClick={() => { setDevice(d.id); setOrientation('portrait'); }}
              title={d.label}
              className={[
                'flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-all',
                device === d.id
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              <span className="text-base leading-none">{d.icon}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>

        {/* Desktop size toggle */}
        {device === 'desktop' && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {DESKTOP_SIZES.map(s => (
              <button
                key={s.id}
                onClick={() => setDesktopSize(s.id)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-all',
                  desktopSize === s.id
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                <span>{s.label}</span>
                <span className="text-xs text-gray-400">{s.width}px</span>
              </button>
            ))}
          </div>
        )}

        {/* Orientation toggle — only for mobile & tablet */}
        {canRotate && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setOrientation('portrait')}
              title="Portrait"
              className={[
                'flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-all',
                orientation === 'portrait'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {/* Portrait icon — tall rectangle */}
              <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
                <rect x="1" y="1" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <rect x="4" y="12" width="4" height="1" rx="0.5" />
              </svg>
              <span>Portrait</span>
              <span className="text-xs text-gray-400">{config.portraitWidth}×{config.portraitHeight}</span>
            </button>
            <button
              onClick={() => setOrientation('landscape')}
              title="Landscape"
              className={[
                'flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-all',
                orientation === 'landscape'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {/* Landscape icon — wide rectangle */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                <rect x="1" y="1" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <rect x="12" y="4" width="1" height="4" rx="0.5" />
              </svg>
              <span>Landscape</span>
              <span className="text-xs text-gray-400">{config.portraitHeight}×{config.portraitWidth}</span>
            </button>
          </div>
        )}

        {/* Dimension badge */}
        {device !== 'full' && (
          <span className="text-xs text-gray-400 font-mono">
            {frameW} × {frameH}
          </span>
        )}

        <div className="flex-1" />

        <button
          onClick={() => useDesignerStore.getState().setPreviewMode(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          ← Back to Designer
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-8">
        {device === 'full' ? (
          <div className="w-full h-full">
            <FormRenderer schema={schema} />
          </div>
        ) : (
          <DeviceFrame config={config} width={frameW} height={frameH} isLandscape={isLandscape} desktopLabel={device === 'desktop' ? activeDesktop.label : undefined}>
            <FormRenderer schema={schema} />
          </DeviceFrame>
        )}
      </div>
    </div>
  );
}

function DeviceFrame({
  config,
  width,
  height,
  isLandscape,
  desktopLabel,
  children,
}: {
  config: DeviceConfig;
  width: number;
  height: number;
  isLandscape: boolean;
  desktopLabel?: string;
  children: React.ReactNode;
}) {
  const { frameClass, id } = config;
  const isMobile = id === 'mobile';
  const isTablet = id === 'tablet';
  const isDesktop = id === 'desktop';

  // Border radius flips with orientation
  const borderRadius = isMobile
    ? isLandscape ? '1.5rem' : '2.5rem'
    : isTablet
    ? isLandscape ? '1rem' : '1.5rem'
    : '0.5rem';

  // Notch/camera position
  const notchStyle: React.CSSProperties = isLandscape
    ? { top: '50%', left: 0, transform: 'translateY(-50%)', width: 6, height: 56, borderRadius: '0 8px 8px 0' }
    : { top: 0, left: '50%', transform: 'translateX(-50%)', width: 112, height: 24, borderRadius: '0 0 16px 16px' };

  const cameraStyle: React.CSSProperties = isLandscape
    ? { top: '50%', left: 6, transform: 'translateY(-50%)' }
    : { top: 12, left: '50%', transform: 'translateX(-50%)' };

  const contentPadding = isMobile
    ? isLandscape ? '0 0 0 24px' : '28px 0 0 0'
    : isTablet
    ? isLandscape ? '0 0 0 20px' : '24px 0 0 0'
    : '12px 0 0 0';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Frame */}
      <div
        className={['bg-white overflow-hidden relative transition-all duration-300', frameClass].join(' ')}
        style={{ width, height, borderRadius, maxWidth: '90vw', maxHeight: '80vh' }}
      >
        {/* Notch / home bar for mobile */}
        {isMobile && (
          <div className="absolute bg-gray-800 z-10" style={notchStyle} />
        )}

        {/* Camera dot for tablet */}
        {isTablet && (
          <div
            className="absolute w-2.5 h-2.5 bg-gray-700 rounded-full z-10"
            style={cameraStyle}
          />
        )}

        {/* Desktop camera */}
        {isDesktop && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full z-10" />
        )}

        {/* Scrollable content */}
        <div className="w-full h-full overflow-y-auto" style={{ padding: contentPadding }}>
          {children}
        </div>
      </div>

      {/* Desktop stand */}
      {isDesktop && (
        <div className="flex flex-col items-center">
          <div className="w-24 h-4 bg-gray-700 rounded-b-sm" />
          <div className="w-40 h-2 bg-gray-600 rounded-sm" />
        </div>
      )}

      {/* Mobile home indicator */}
      {isMobile && !isLandscape && (
        <div className="w-24 h-1 bg-gray-700 rounded-full -mt-3" />
      )}
      {isMobile && isLandscape && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1 h-16 bg-gray-700 rounded-full" />
      )}
    </div>
  );
}
