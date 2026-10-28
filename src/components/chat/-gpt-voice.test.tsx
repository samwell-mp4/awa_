import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { GptVoiceOrb } from "./GptVoiceOrb";
import { GptVoiceModal } from "./GptVoiceModal";

describe("GptVoiceOrb", () => {
  it("renders correctly with default props", () => {
    const { container } = render(<GptVoiceOrb state="idle" size="lg" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with mini/xs sizes for inline chat audio", () => {
    const { container } = render(<GptVoiceOrb state="speaking" size="xs" showRipple={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("triggers onClick when tapped", () => {
    const handleClick = vi.fn();
    render(<GptVoiceOrb state="idle" onClick={handleClick} />);
    const orb = screen.getByRole("button");
    fireEvent.click(orb);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe("GptVoiceModal", () => {
  it("renders title, orb, and control buttons when open", () => {
    const handleClose = vi.fn();
    const handleMic = vi.fn();
    const handleSend = vi.fn();

    render(
      <GptVoiceModal
        isOpen={true}
        onClose={handleClose}
        title="Professor Akuã"
        subtitle="Mestre de Patxôhã"
        voiceState="idle"
        voicePaused={false}
        isRecording={false}
        onToggleMic={handleMic}
        onPauseVoice={vi.fn()}
        onResumeVoice={vi.fn()}
        onStopVoice={vi.fn()}
        onSendMessage={handleSend}
        suggestions={[{ label: "Saudações", prompt: "Como se diz olá?" }]}
      />
    );

    expect(screen.getByText("Professor Akuã")).toBeInTheDocument();
    expect(screen.getByText(/Saudações/)).toBeInTheDocument();
    expect(screen.getByTitle(/Falar no microfone/)).toBeInTheDocument();
  });
});
