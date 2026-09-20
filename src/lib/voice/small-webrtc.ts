export type PipecatRequestData = Record<string, string | boolean>;

export type SmallWebRtcSession = {
  pc: RTCPeerConnection;
  disconnect: () => void;
  sendAppMessage: (payload: Record<string, unknown>) => void;
};

type IcePayload = {
  candidate: string;
  sdp_mid: string;
  sdp_mline_index: number;
};

const DEFAULT_STUN = [{ urls: "stun:stun.l.google.com:19302" }];

function pipecatBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_PIPECAT_URL?.trim() ||
    "http://127.0.0.1:8765";
  return raw.replace(/\/$/, "");
}

export async function connectSmallWebRtc(options: {
  requestData: PipecatRequestData;
  onMessage?: (payload: unknown) => void;
  onConnectionState?: (state: RTCPeerConnectionState) => void;
}): Promise<SmallWebRtcSession> {
  const base = pipecatBaseUrl();
  const pc = new RTCPeerConnection({ iceServers: DEFAULT_STUN });

  const pendingCandidates: IcePayload[] = [];
  let pcId: string | null = null;

  const dataChannel = pc.createDataChannel("chat");

  function bindDataChannel(channel: RTCDataChannel) {
    channel.onmessage = (messageEvent) => {
      try {
        const parsed = JSON.parse(String(messageEvent.data)) as unknown;
        options.onMessage?.(parsed);
      } catch {
        // ignore non-JSON keepalive traffic
      }
    };
  }

  bindDataChannel(dataChannel);

  pc.onconnectionstatechange = () => {
    options.onConnectionState?.(pc.connectionState);
  };

  pc.ondatachannel = (event) => {
    bindDataChannel(event.channel);
  };

  async function flushCandidates() {
    if (!pcId || pendingCandidates.length === 0) {
      return;
    }
    const candidates = pendingCandidates.splice(0, pendingCandidates.length);
    await fetch(`${base}/api/offer`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pc_id: pcId, candidates }),
    });
  }

  pc.onicecandidate = (event) => {
    if (!event.candidate) {
      void flushCandidates();
      return;
    }
    pendingCandidates.push({
      candidate: event.candidate.candidate,
      sdp_mid: event.candidate.sdpMid ?? "",
      sdp_mline_index: event.candidate.sdpMLineIndex ?? 0,
    });
    void flushCandidates();
  };

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  for (const track of stream.getAudioTracks()) {
    pc.addTrack(track, stream);
  }

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const response = await fetch(`${base}/api/offer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sdp: offer.sdp,
      type: offer.type,
      // Pipecat FastAPI dataclass reads snake_case `request_data`.
      request_data: options.requestData,
      requestData: options.requestData,
    }),
  });

  if (!response.ok) {
    stream.getTracks().forEach((track) => track.stop());
    pc.close();
    throw new Error("voice connection failed");
  }

  const answer = (await response.json()) as {
    sdp: string;
    type: RTCSdpType;
    pc_id?: string;
  };

  pcId = answer.pc_id ?? null;
  await pc.setRemoteDescription({
    type: answer.type,
    sdp: answer.sdp,
  });

  return {
    pc,
    disconnect: () => {
      stream.getTracks().forEach((track) => track.stop());
      pc.close();
    },
    sendAppMessage: (payload) => {
      if (dataChannel.readyState === "open") {
        dataChannel.send(JSON.stringify(payload));
      }
    },
  };
}
