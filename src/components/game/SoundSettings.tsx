import { Volume2, VolumeX, Music, Music2 } from 'lucide-react';
import { Card } from '../ui';
import { useSoundStore } from '../../services/soundService';
import { cn } from '../../utils/helpers';

interface SoundSettingsProps {
  compact?: boolean;
}

export function SoundSettings({ compact = false }: SoundSettingsProps) {
  const {
    masterVolume,
    sfxVolume,
    bgmVolume,
    sfxEnabled,
    bgmEnabled,
    setMasterVolume,
    setSfxVolume,
    setBgmVolume,
    toggleSfx,
    toggleBgm
  } = useSoundStore();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSfx}
          className={cn(
            'p-2 rounded-lg transition-colors',
            sfxEnabled
              ? 'bg-primary-500/20 text-primary-400'
              : 'bg-dark-700 text-dark-500'
          )}
          title={sfxEnabled ? '효과음 끄기' : '효과음 켜기'}
        >
          {sfxEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={toggleBgm}
          className={cn(
            'p-2 rounded-lg transition-colors',
            bgmEnabled
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-dark-700 text-dark-500'
          )}
          title={bgmEnabled ? '배경음악 끄기' : '배경음악 켜기'}
        >
          {bgmEnabled ? (
            <Music className="w-5 h-5" />
          ) : (
            <Music2 className="w-5 h-5" />
          )}
        </button>
      </div>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold text-dark-100 flex items-center gap-2">
        <Volume2 className="w-5 h-5" />
        사운드 설정
      </h3>

      {/* Master Volume */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-dark-300">마스터 볼륨</label>
          <span className="text-xs text-dark-500">{Math.round(masterVolume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={masterVolume}
          onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
      </div>

      {/* SFX */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSfx}
              className={cn(
                'p-1.5 rounded transition-colors',
                sfxEnabled ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-700 text-dark-500'
              )}
            >
              {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <label className="text-sm text-dark-300">효과음</label>
          </div>
          <span className="text-xs text-dark-500">{Math.round(sfxVolume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={sfxVolume}
          onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
          disabled={!sfxEnabled}
          className={cn(
            'w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500',
            !sfxEnabled && 'opacity-50'
          )}
        />
      </div>

      {/* BGM */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBgm}
              className={cn(
                'p-1.5 rounded transition-colors',
                bgmEnabled ? 'bg-purple-500/20 text-purple-400' : 'bg-dark-700 text-dark-500'
              )}
            >
              {bgmEnabled ? <Music className="w-4 h-4" /> : <Music2 className="w-4 h-4" />}
            </button>
            <label className="text-sm text-dark-300">배경음악</label>
          </div>
          <span className="text-xs text-dark-500">{Math.round(bgmVolume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={bgmVolume}
          onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
          disabled={!bgmEnabled}
          className={cn(
            'w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-purple-500',
            !bgmEnabled && 'opacity-50'
          )}
        />
      </div>

      <p className="text-xs text-dark-500 text-center pt-2 border-t border-dark-700">
        사운드 설정은 자동으로 저장됩니다
      </p>
    </Card>
  );
}
