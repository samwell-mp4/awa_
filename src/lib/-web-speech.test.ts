import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  isBrowserSpeechSupported,
  getBrowserSpeechRecognition,
  useBrowserSpeech,
} from "./web-speech";

class MockSpeechRecognition {
  continuous = true;
  interimResults = true;
  lang = "pt-BR";
  maxAlternatives = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  onresult: ((e: any) => void) | null = null;

  start() {
    setTimeout(() => {
      this.onstart?.();
    }, 0);
  }

  stop() {
    setTimeout(() => {
      this.onend?.();
    }, 0);
  }

  abort() {
    this.onend?.();
  }
}

describe("web-speech helper and hook", () => {
  const originalSpeechRecognition = (window as any).SpeechRecognition;
  const originalWebkitSpeechRecognition = (window as any).webkitSpeechRecognition;

  beforeEach(() => {
    (window as any).SpeechRecognition = MockSpeechRecognition;
  });

  afterEach(() => {
    (window as any).SpeechRecognition = originalSpeechRecognition;
    (window as any).webkitSpeechRecognition = originalWebkitSpeechRecognition;
  });

  it("detects browser speech recognition support", () => {
    expect(isBrowserSpeechSupported()).toBe(true);
    expect(getBrowserSpeechRecognition()).toBe(MockSpeechRecognition);
  });

  it("handles start, onresult and stop correctly", async () => {
    const { result } = renderHook(() => useBrowserSpeech("pt-BR"));

    expect(result.current.isSupported).toBe(true);

    let started = false;
    await act(async () => {
      started = await result.current.start({
        onLiveText: vi.fn(),
      });
    });

    expect(started).toBe(true);
    expect(result.current.isListening).toBe(true);

    // Stop speech
    let finalOutput = "";
    act(() => {
      finalOutput = result.current.stop();
    });

    expect(result.current.isListening).toBe(false);
  });
});
