'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export const TEXT_SCALES = [100, 125, 150, 175] as const;
export type TextScale = (typeof TEXT_SCALES)[number];
export type ContrastMode = 'standard' | 'high';
export type MotionMode = 'full' | 'reduce';
export type LanguageMode = 'plain' | 'technical';

export const TEXT_SCALE_NAMES: Record<TextScale, string> = {
  100: 'Normal (100%)',
  125: 'Large (125%)',
  150: 'Larger (150%)',
  175: 'Largest (175%)',
};

export interface AccessibilitySettings {
  textScale: TextScale;
  contrast: ContrastMode;
  motion: MotionMode;
  language: LanguageMode;
  dyslexia: boolean;
  clickToListen: boolean;
  speechRate: number; // 0.75, 1.0, 1.25, 1.5
}

export const A11Y_STORAGE_KEY = 'sphinx.a11y.v2';

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textScale: 100,
  contrast: 'standard',
  motion: 'full',
  language: 'plain',
  dyslexia: false,
  clickToListen: false,
  speechRate: 1.0,
};

export interface SpeechStatus {
  isSpeaking: boolean;
  isPaused: boolean;
  hasVoiceSupport: boolean;
  hasHindiVoice: boolean;
  activeText: string | null;
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  speechStatus: SpeechStatus;
  increaseText: () => void;
  decreaseText: () => void;
  setTextScale: (scale: TextScale) => void;
  toggleContrast: () => void;
  toggleMotion: () => void;
  toggleLanguage: () => void;
  toggleDyslexia: () => void;
  toggleClickToListen: () => void;
  setSpeechRate: (rate: number) => void;
  readThisPage: () => void;
  speakText: (text: string) => void;
  pauseSpeech: () => void;
  resumeSpeech: () => void;
  stopSpeech: () => void;
  reset: () => void;
  announce: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function isTextScale(value: unknown): value is TextScale {
  return TEXT_SCALES.includes(value as TextScale);
}

function readSystemDefaults(): AccessibilitySettings {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return DEFAULT_SETTINGS;
  }
  return {
    ...DEFAULT_SETTINGS,
    contrast: window.matchMedia('(prefers-contrast: more)').matches ? 'high' : 'standard',
    motion: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'full',
  };
}

function loadSettings(): AccessibilitySettings {
  const base = readSystemDefaults();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<AccessibilitySettings> | null;
    if (!parsed || typeof parsed !== 'object') return base;
    return {
      textScale: isTextScale(parsed.textScale) ? parsed.textScale : base.textScale,
      contrast: parsed.contrast === 'high' || parsed.contrast === 'standard' ? parsed.contrast : base.contrast,
      motion: parsed.motion === 'reduce' || parsed.motion === 'full' ? parsed.motion : base.motion,
      language: parsed.language === 'technical' || parsed.language === 'plain' ? parsed.language : base.language,
      dyslexia: Boolean(parsed.dyslexia),
      clickToListen: Boolean(parsed.clickToListen),
      speechRate: typeof parsed.speechRate === 'number' ? parsed.speechRate : 1.0,
    };
  } catch {
    return base;
  }
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>({
    isSpeaking: false,
    isPaused: false,
    hasVoiceSupport: false,
    hasHindiVoice: false,
    activeText: null,
  });

  // Check voice synthesis support and voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const checkVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const hasHindi = voices.some((v) => v.lang.startsWith('hi'));
        setSpeechStatus((prev) => ({
          ...prev,
          hasVoiceSupport: true,
          hasHindiVoice: hasHindi,
        }));
      };

      checkVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = checkVoices;
      }
    }
  }, []);

  // Load saved settings
  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  // Apply data attributes to document root
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.dataset.textScale = String(settings.textScale);
    root.dataset.contrast = settings.contrast;
    root.dataset.motion = settings.motion;
    root.dataset.dyslexia = settings.dyslexia ? 'true' : 'false';
    root.dataset.clickToListen = settings.clickToListen ? 'true' : 'false';

    if (settings.clickToListen) {
      document.body.classList.add('click-to-listen-active');
    } else {
      document.body.classList.remove('click-to-listen-active');
    }

    try {
      window.localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // storage unavailable
    }
  }, [settings, hydrated]);

  const announce = useCallback((message: string) => {
    setLiveMessage('');
    window.setTimeout(() => setLiveMessage(message), 50);
  }, []);

  // Speak text with speech highlight
  const speakText = useCallback(
    (text: string, highlightElement?: HTMLElement) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        announce('Speech synthesis is not supported on this browser.');
        return;
      }

      window.speechSynthesis.cancel();

      // Clean up previous highlights
      document.querySelectorAll('.speech-highlight').forEach((el) => {
        el.classList.remove('speech-highlight');
      });

      if (highlightElement) {
        highlightElement.classList.add('speech-highlight');
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.speechRate;

      // Select natural English voice (prefer Indian English if available)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.lang === 'en-IN') ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setSpeechStatus((prev) => ({
          ...prev,
          isSpeaking: true,
          isPaused: false,
          activeText: text,
        }));
      };

      utterance.onend = () => {
        setSpeechStatus((prev) => ({
          ...prev,
          isSpeaking: false,
          isPaused: false,
          activeText: null,
        }));
        if (highlightElement) {
          highlightElement.classList.remove('speech-highlight');
        }
      };

      utterance.onerror = () => {
        setSpeechStatus((prev) => ({
          ...prev,
          isSpeaking: false,
          isPaused: false,
          activeText: null,
        }));
        if (highlightElement) {
          highlightElement.classList.remove('speech-highlight');
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [settings.speechRate, announce]
  );

  const pauseSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setSpeechStatus((prev) => ({ ...prev, isPaused: true }));
      announce('Speech paused.');
    }
  }, [announce]);

  const resumeSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setSpeechStatus((prev) => ({ ...prev, isPaused: false }));
      announce('Speech resumed.');
    }
  }, [announce]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      document.querySelectorAll('.speech-highlight').forEach((el) => {
        el.classList.remove('speech-highlight');
      });
      setSpeechStatus((prev) => ({
        ...prev,
        isSpeaking: false,
        isPaused: false,
        activeText: null,
      }));
      announce('Speech stopped.');
    }
  }, [announce]);

  // Read entire main page content
  const readThisPage = useCallback(() => {
    if (typeof window === 'undefined') return;
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    // Extract readable paragraphs, headings, and labels
    const textElements = mainEl.querySelectorAll('h1, h2, h3, p, button, label');
    const texts: string[] = [];
    textElements.forEach((el) => {
      const t = el.textContent?.trim();
      if (t && t.length > 2 && !el.closest('.sr-only')) {
        texts.push(t);
      }
    });

    const fullText = texts.join('. ');
    if (fullText) {
      speakText(fullText, mainEl as HTMLElement);
      announce('Reading current page.');
    }
  }, [speakText, announce]);

  // Click to listen event listener
  useEffect(() => {
    if (!settings.clickToListen || typeof window === 'undefined') return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Don't intercept clicks inside the accessibility control bar or buttons
      if (target.closest('[data-a11y-ignore="true"]') || target.closest('header')) {
        return;
      }

      // Find text container
      const readable = target.closest('p, h1, h2, h3, h4, h5, span, li, button, td');
      if (readable) {
        const text = readable.textContent?.trim();
        if (text) {
          e.preventDefault();
          e.stopPropagation();
          speakText(text, readable as HTMLElement);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [settings.clickToListen, speakText]);

  // Controls
  const stepText = useCallback(
    (direction: 1 | -1) => {
      const index = TEXT_SCALES.indexOf(settings.textScale);
      const next = TEXT_SCALES[Math.min(TEXT_SCALES.length - 1, Math.max(0, index + direction))];
      if (next === settings.textScale) {
        announce(direction > 0 ? 'Text is at largest scale.' : 'Text is at smallest scale.');
        return;
      }
      setSettings((prev) => ({ ...prev, textScale: next }));
      announce(`Text size set to ${TEXT_SCALE_NAMES[next]}.`);
    },
    [settings.textScale, announce]
  );

  const increaseText = useCallback(() => stepText(1), [stepText]);
  const decreaseText = useCallback(() => stepText(-1), [stepText]);

  const setTextScale = useCallback(
    (scale: TextScale) => {
      setSettings((prev) => ({ ...prev, textScale: scale }));
      announce(`Text size set to ${TEXT_SCALE_NAMES[scale]}.`);
    },
    [announce]
  );

  const toggleContrast = useCallback(() => {
    const next: ContrastMode = settings.contrast === 'high' ? 'standard' : 'high';
    setSettings((prev) => ({ ...prev, contrast: next }));
    announce(next === 'high' ? 'High contrast enabled.' : 'Standard contrast enabled.');
  }, [settings.contrast, announce]);

  const toggleMotion = useCallback(() => {
    const next: MotionMode = settings.motion === 'reduce' ? 'full' : 'reduce';
    setSettings((prev) => ({ ...prev, motion: next }));
    announce(next === 'reduce' ? 'Animations stopped (Reduced motion active).' : 'Animations enabled.');
  }, [settings.motion, announce]);

  const toggleLanguage = useCallback(() => {
    const next: LanguageMode = settings.language === 'plain' ? 'technical' : 'plain';
    setSettings((prev) => ({ ...prev, language: next }));
    announce(next === 'technical' ? 'Technical terms shown.' : 'Plain words shown.');
  }, [settings.language, announce]);

  const toggleDyslexia = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.dyslexia;
      announce(next ? 'Dyslexia-friendly reading mode enabled.' : 'Standard typography restored.');
      return { ...prev, dyslexia: next };
    });
  }, [announce]);

  const toggleClickToListen = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.clickToListen;
      announce(next ? 'Click to listen enabled. Click any text to hear it read.' : 'Click to listen disabled.');
      return { ...prev, clickToListen: next };
    });
  }, [announce]);

  const setSpeechRate = useCallback(
    (rate: number) => {
      setSettings((prev) => ({ ...prev, speechRate: rate }));
      announce(`Speech rate set to ${rate}x.`);
    },
    [announce]
  );

  const reset = useCallback(() => {
    stopSpeech();
    setSettings(readSystemDefaults());
    announce('Accessibility settings reset to default.');
  }, [announce, stopSpeech]);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      settings,
      speechStatus,
      increaseText,
      decreaseText,
      setTextScale,
      toggleContrast,
      toggleMotion,
      toggleLanguage,
      toggleDyslexia,
      toggleClickToListen,
      setSpeechRate,
      readThisPage,
      speakText,
      pauseSpeech,
      resumeSpeech,
      stopSpeech,
      reset,
      announce,
    }),
    [
      settings,
      speechStatus,
      increaseText,
      decreaseText,
      setTextScale,
      toggleContrast,
      toggleMotion,
      toggleLanguage,
      toggleDyslexia,
      toggleClickToListen,
      setSpeechRate,
      readThisPage,
      speakText,
      pauseSpeech,
      resumeSpeech,
      stopSpeech,
      reset,
      announce,
    ]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMessage}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used inside <AccessibilityProvider>.');
  }
  return context;
}