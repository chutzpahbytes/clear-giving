'use client';

import React, { useState } from 'react';
import {
  Accessibility,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Contrast,
  Languages,
  Minus,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sliders,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  TEXT_SCALE_NAMES,
  TEXT_SCALES,
  useAccessibility,
  type TextScale,
} from '@/providers/AccessibilityProvider';

export function AccessibilityBar() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    settings,
    speechStatus,
    setTextScale,
    increaseText,
    decreaseText,
    toggleContrast,
    toggleMotion,
    toggleLanguage,
    toggleDyslexia,
    toggleClickToListen,
    setSpeechRate,
    readThisPage,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    reset,
  } = useAccessibility();

  const atSmallest = settings.textScale === TEXT_SCALES[0];
  const atLargest = settings.textScale === TEXT_SCALES[TEXT_SCALES.length - 1];

  return (
    <section
      aria-label="Accessibility and reading tools"
      data-a11y-ignore="true"
      className="sticky top-0 z-40 border-b-2 border-line bg-surface shadow-sm"
    >
      {/* Compact Top Bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="a11y-panel"
            className="btn btn-secondary text-xs sm:text-sm py-1 px-3 flex items-center gap-2"
          >
            <Accessibility className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="font-bold">Accessibility & Reading Tools</span>
            <span className="hidden md:inline text-xs text-muted">
              ({settings.textScale}% · {settings.contrast === 'high' ? 'High Contrast' : 'Standard'} ·{' '}
              {settings.dyslexia ? 'Dyslexia Mode' : 'Standard Font'})
            </span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
            )}
          </button>

          {/* Quick Click-to-Listen indicator badge */}
          {settings.clickToListen && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded bg-primary/10 border border-primary px-2 py-0.5 text-xs font-semibold text-primary">
              <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" />
              Click-to-Listen Active
            </span>
          )}
        </div>

        {/* Quick Read Page Controls */}
        <div className="flex items-center gap-1.5">
          {speechStatus.isSpeaking ? (
            <>
              {speechStatus.isPaused ? (
                <button
                  type="button"
                  onClick={resumeSpeech}
                  className="btn btn-primary text-xs py-1 px-2.5"
                  aria-label="Resume reading"
                >
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseSpeech}
                  className="btn btn-secondary text-xs py-1 px-2.5"
                  aria-label="Pause reading"
                >
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Pause</span>
                </button>
              )}
              <button
                type="button"
                onClick={stopSpeech}
                className="btn btn-secondary text-xs py-1 px-2.5 text-danger"
                aria-label="Stop reading"
              >
                <Square className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Stop</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={readThisPage}
              className="btn btn-secondary text-xs py-1 px-2.5"
              aria-label="Read this page aloud"
            >
              <Volume2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>Read Page</span>
            </button>
          )}

          <button
            type="button"
            onClick={reset}
            className="btn btn-secondary text-xs py-1 px-2 text-muted hover:text-ink"
            aria-label="Reset accessibility settings"
            title="Reset to defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Expandable Comprehensive Options Drawer */}
      {isOpen && (
        <div
          id="a11y-panel"
          className="border-t-2 border-line bg-surface/95 backdrop-blur-sm px-4 py-5 shadow-inner"
        >
          <div className="mx-auto max-w-6xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1. Visual & Typography */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sliders className="h-4 w-4" aria-hidden="true" />
                <span>Text Size & Legibility</span>
              </h3>

              <div role="group" aria-label="Text scale options" className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary text-sm py-1 px-2.5"
                    onClick={decreaseText}
                    aria-disabled={atSmallest}
                    aria-label="Make text smaller"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span aria-hidden="true">A-</span>
                  </button>

                  <div className="grid grid-cols-4 gap-1 flex-1">
                    {TEXT_SCALES.map((scale) => (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => setTextScale(scale)}
                        className={`rounded border px-1.5 py-1 text-xs font-semibold ${
                          settings.textScale === scale
                            ? 'border-primary bg-primary text-primary-fg'
                            : 'border-line bg-surface text-ink hover:bg-ink/10'
                        }`}
                      >
                        {scale}%
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary text-sm py-1 px-2.5"
                    onClick={increaseText}
                    aria-disabled={atLargest}
                    aria-label="Make text larger"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span aria-hidden="true" className="font-bold">
                      A+
                    </span>
                  </button>
                </div>
              </div>

              {/* High Contrast & Dyslexia Toggles */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={toggleContrast}
                  aria-pressed={settings.contrast === 'high'}
                  className={`btn w-full justify-between text-xs py-2 px-3 ${
                    settings.contrast === 'high' ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <Contrast className="h-4 w-4" aria-hidden="true" />
                    <span>High Contrast (Black & Gold)</span>
                  </span>
                  <span className="text-xs font-bold">
                    {settings.contrast === 'high' ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleDyslexia}
                  aria-pressed={settings.dyslexia}
                  className={`btn w-full justify-between text-xs py-2 px-3 ${
                    settings.dyslexia ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    <span>Dyslexia-Friendly Mode</span>
                  </span>
                  <span className="text-xs font-bold">{settings.dyslexia ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>

            {/* 2. Voice & Speech Synthesis */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                <span>Text-to-Speech & Audio</span>
              </h3>

              {/* Click-to-Listen Mode */}
              <button
                type="button"
                onClick={toggleClickToListen}
                aria-pressed={settings.clickToListen}
                className={`btn w-full justify-between text-xs py-2 px-3 ${
                  settings.clickToListen ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <MousePointerClick className="h-4 w-4" aria-hidden="true" />
                  <span>Click-to-Listen (Tap text to hear)</span>
                </span>
                <span className="text-xs font-bold">
                  {settings.clickToListen ? 'ACTIVE' : 'OFF'}
                </span>
              </button>

              {/* Speech Speed Control */}
              <div className="space-y-1">
                <label className="text-xs text-muted block font-semibold">
                  Reading Voice Speed: {settings.speechRate}x
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setSpeechRate(rate)}
                      className={`rounded border px-2 py-1 text-xs font-semibold ${
                        settings.speechRate === rate
                          ? 'border-primary bg-primary text-primary-fg'
                          : 'border-line bg-surface text-ink hover:bg-ink/10'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Hindi Voice Device Check Notice */}
              <p className="text-[11px] text-muted leading-tight">
                {speechStatus.hasHindiVoice
                  ? '✓ Hindi & English speech voices supported on this browser.'
                  : 'ℹ Note: Speech uses device speech engine. Hindi voice depends on visitor operating system.'}
              </p>
            </div>

            {/* 3. Motion & Language */}
            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Languages className="h-4 w-4" aria-hidden="true" />
                <span>Motion & Language</span>
              </h3>

              <button
                type="button"
                onClick={toggleMotion}
                aria-pressed={settings.motion === 'reduce'}
                className={`btn w-full justify-between text-xs py-2 px-3 ${
                  settings.motion === 'reduce' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Pause className="h-4 w-4" aria-hidden="true" />
                  <span>Stop Animations (Reduced Motion)</span>
                </span>
                <span className="text-xs font-bold">
                  {settings.motion === 'reduce' ? 'STOPPED' : 'PLAY'}
                </span>
              </button>

              <button
                type="button"
                onClick={toggleLanguage}
                aria-pressed={settings.language === 'technical'}
                className={`btn w-full justify-between text-xs py-2 px-3 ${
                  settings.language === 'technical' ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Languages className="h-4 w-4" aria-hidden="true" />
                  <span>Dictionary: Plain Words Mode</span>
                </span>
                <span className="text-xs font-bold">
                  {settings.language === 'plain' ? 'PLAIN' : 'TECH'}
                </span>
              </button>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={reset}
                  className="btn btn-secondary w-full text-xs py-2 px-3 text-muted hover:text-ink"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Reset All Settings to Defaults</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}