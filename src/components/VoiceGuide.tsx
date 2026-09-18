import { useEffect, useRef, useState } from "react";
import { AudioLines, Mic, MicOff, PhoneOff } from "lucide-react";
type Props = { onDraft?: (text: string) => void; disabled?: boolean };
export default function VoiceGuide({ onDraft, disabled = false }: Props) {
  const [state, setState] = useState<"idle" | "connecting" | "live">("idle"),
    [error, setError] = useState(""),
    [muted, setMuted] = useState(false),
    [caption, setCaption] = useState(""),
    [remaining, setRemaining] = useState(240);
  const refs = useRef<{
    pc?: RTCPeerConnection;
    stream?: MediaStream;
    audio?: HTMLAudioElement;
    controller?: AbortController;
    timer?: ReturnType<typeof setInterval>;
    connectTimer?: ReturnType<typeof setTimeout>;
    token?: string;
    generation: number;
  }>({ generation: 0 });
  const draftCallback = useRef(onDraft);
  draftCallback.current = onDraft;
  function stop(update = true) {
    const r = refs.current;
    r.generation++;
    r.controller?.abort();
    r.stream?.getTracks().forEach((t) => t.stop());
    r.pc?.close();
    r.audio?.pause();
    if (r.audio) r.audio.srcObject = null;
    clearInterval(r.timer);
    clearTimeout(r.connectTimer);
    if (r.token) {
      void fetch("/api/voice/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: r.token }),
        keepalive: true,
      }).catch(() => {});
      r.token = undefined;
    }
    r.pc = undefined;
    r.stream = undefined;
    if (update) {
      setState("idle");
      setMuted(false);
    }
  }
  useEffect(() => {
    const leave = () => stop(false);
    window.addEventListener("pagehide", leave);
    return () => {
      window.removeEventListener("pagehide", leave);
      stop(false);
    };
  }, []);
  async function start() {
    if (state !== "idle") return;
    setError("");
    setCaption("");
    setState("connecting");
    setRemaining(240);
    const r = refs.current,
      generation = ++r.generation;
    r.controller = new AbortController();
    const current = () => r.generation === generation;
    r.connectTimer = setTimeout(() => {
      if (current()) {
        setError(
          "Voice took too long to connect. Please try again or use text.",
        );
        stop();
      }
    }, 30000);
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error(
          "Voice needs a secure browser with microphone support. Text chat is available below.",
        );
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (!current()) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      r.stream = stream;
      const pc = new RTCPeerConnection();
      r.pc = pc;
      const audio = new Audio();
      audio.autoplay = true;
      r.audio = audio;
      pc.ontrack = (e) => {
        audio.srcObject = e.streams[0];
        void audio.play().catch(() => {
          setError(
            "Your browser paused audio. End the call and start it again to allow playback.",
          );
        });
      };
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      pc.onconnectionstatechange = () => {
        if (
          current() &&
          ["failed", "disconnected"].includes(pc.connectionState)
        ) {
          setError(
            "The voice connection ended. You can reconnect or use text.",
          );
          stop();
        }
      };
      const dc = pc.createDataChannel("oai-events");
      let responseCaption = "";
      dc.onopen = () => {
        if (!current()) return;
        clearTimeout(r.connectTimer);
        setState("live");
        dc.send(JSON.stringify({ type: "conversation.item.create", item: { type: "message", role: "user", content: [{ type: "input_text", text: "Please introduce yourself briefly in one sentence and ask what I would like to explore." }] } }));
        dc.send(JSON.stringify({ type: "response.create" }));
        const end = Date.now() + 240000;
        r.timer = setInterval(() => {
          if (!current()) return;
          const seconds = Math.max(0, Math.ceil((end - Date.now()) / 1000));
          setRemaining(seconds);
          if (!seconds) {
            stop();
            setCaption(
              "Voice session finished. You can continue in text or start another conversation.",
            );
          }
        }, 1000);
      };
      dc.onmessage = (event) => {
        if (!current()) return;
        try {
          const e = JSON.parse(event.data);
          if (e.type === "response.created") responseCaption = "";
          if (e.type === "response.output_audio_transcript.delta") {
            responseCaption += e.delta;
            setCaption(responseCaption.replace(/[\u2014\u2013]/g, ", "));
          }
          if (e.type === "response.output_audio_transcript.done")
            setCaption(e.transcript.replace(/[\u2014\u2013]/g, ", "));
          if (
            e.type ===
              "conversation.item.input_audio_transcription.completed" &&
            e.transcript
          )
            setCaption(`You: ${e.transcript}`);
          if (
            e.type === "response.function_call_arguments.done" &&
            e.name === "prepare_project_brief"
          ) {
            const args = JSON.parse(e.arguments);
            if (typeof args.brief === "string" && draftCallback.current) {
              draftCallback.current(args.brief.slice(0, 5000));
              dc.send(
                JSON.stringify({
                  type: "conversation.item.create",
                  item: {
                    type: "function_call_output",
                    call_id: e.call_id,
                    output: JSON.stringify({
                      status: "draft_prepared_for_review",
                      sent: false,
                    }),
                  },
                }),
              );
              dc.send(JSON.stringify({ type: "response.create" }));
            }
          }
          if (e.type === "error") {
            setError(
              "The voice guide hit a problem. Try reconnecting or use the text chat.",
            );
            stop();
          }
        } catch {
          setError(
            "A voice update could not be read. You can continue in text.",
          );
        }
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (!current()) return;
      const response = await fetch("/api/voice/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/sdp",
          "X-Voice-Session": crypto.randomUUID(),
        },
        body: offer.sdp,
        signal: r.controller.signal,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error ||
            "Voice is temporarily unavailable. Please try text chat.",
        );
      }
      const token = response.headers.get("X-Voice-Token");
      if (token) r.token = token;
      const sdp = await response.text();
      if (!current()) {
        if (token)
          void fetch("/api/voice/stop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
            keepalive: true,
          });
        return;
      }
      await pc.setRemoteDescription({ type: "answer", sdp });
    } catch (e) {
      if (!current()) return;
      const name = e instanceof Error ? e.name : "";
      setError(
        name === "NotAllowedError"
          ? "Microphone access was not granted. You can allow it in your browser or keep using text."
          : e instanceof Error
            ? e.message
            : "Unable to start voice.",
      );
      stop();
    }
  }
  return (
    <div className="voice-control">
      {state === "idle" ? (
        <button
          className="voice-start"
          onClick={start}
          disabled={disabled}
          type="button"
        >
          <AudioLines size={17} />
          Talk to the AI with your voice
        </button>
      ) : (
        <div className="voice-session">
          <div className="voice-session-top">
            <span>
              <i className="voice-live-dot" />
              {state === "connecting"
                ? "Connecting…"
                : `AI voice · ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
            </span>
            {state === "live" && (
              <button
                onClick={() => {
                  const next = !muted;
                  refs.current.stream
                    ?.getAudioTracks()
                    .forEach((t) => (t.enabled = !next));
                  setMuted(next);
                }}
                type="button"
                aria-label={muted ? "Unmute microphone" : "Mute microphone"}
              >
                {muted ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            )}
            <button type="button" onClick={() => stop()}>
              <PhoneOff size={14} />
              End
            </button>
          </div>
          {caption && (
            <p className="voice-captions" role="status" aria-live="polite">
              {caption}
            </p>
          )}
        </div>
      )}
      {error && (
        <p className="voice-error" role="alert">
          {error}
        </p>
      )}
      <small>
        {state === "idle"
          ? "AI-generated voice · Microphone starts only when you choose · 4-minute sessions"
          : "Microphone active unless muted. Closing this guide ends the call."}
      </small>
    </div>
  );
}
