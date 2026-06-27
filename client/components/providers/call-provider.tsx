"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { useSocket } from "./socket-provider";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { IncomingCallDialog } from "../call/incoming-call-dialog";
import { ActiveCallUI } from "../call/active-call-ui";

interface IncomingCall {
  from: string;
  callerName: string;
  signalData: any;
}

interface ActiveCall {
  with: string;
  userName: string;
  isMuted: boolean;
  isSpeakerOn: boolean;
  duration: number;
}

interface CallContextValue {
  incomingCall: IncomingCall | null;
  activeCall: ActiveCall | null;
  startCall: (targetUserId: string, userName: string) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
}

const CallContext = createContext<CallContextValue | null>(null);

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallProvider");
  return ctx;
}

const STUN_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function CallProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const callWithRef = useRef<{ userId: string; userName: string } | null>(null);
  const activeCallRef = useRef<ActiveCall | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  activeCallRef.current = activeCall;

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    pendingCandidatesRef.current = [];
    callWithRef.current = null;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const createPeerConnection = useCallback((remoteDescription?: RTCSessionDescriptionInit) => {
    const pc = new RTCPeerConnection(STUN_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate && callWithRef.current) {
        socket?.emit("call_ice_candidate", {
          targetUserId: callWithRef.current.userId,
          candidate: e.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = e.streams[0];
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === "disconnected" ||
        pc.iceConnectionState === "failed"
      ) {
        cleanup();
        setActiveCall(null);
        setIncomingCall(null);
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }

    if (remoteDescription) {
      pc.setRemoteDescription(new RTCSessionDescription(remoteDescription)).catch(() => {});
    }

    peerRef.current = pc;
    return pc;
  }, [socket, cleanup]);

  const getLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      return stream;
    } catch {
      toast.error("Microphone access denied");
      return null;
    }
  }, []);

  const startCall = useCallback(async (targetUserId: string, userName: string) => {
    if (!socket || !currentUserId) return;

    const stream = await getLocalStream();
    if (!stream) return;

    callWithRef.current = { userId: targetUserId, userName };
    const pc = createPeerConnection();

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call_user", {
        targetUserId,
        callerName: session?.user?.name || "Unknown",
        signalData: pc.localDescription,
      }, (response: { status: string }) => {
        if (response?.status === "offline") {
          toast.error("User is offline");
          cleanup();
          setActiveCall(null);
        }
      });

      setActiveCall({
        with: targetUserId,
        userName,
        isMuted: false,
        isSpeakerOn: false,
        duration: 0,
      });
    } catch (err) {
      console.error("Failed to start call:", err);
      cleanup();
    }
  }, [socket, currentUserId, session, getLocalStream, createPeerConnection, cleanup]);

  const acceptCall = useCallback(async () => {
    if (!socket || !incomingCall) return;

    const stream = await getLocalStream();
    if (!stream) return;

    callWithRef.current = { userId: incomingCall.from, userName: incomingCall.callerName };
    const pc = createPeerConnection(incomingCall.signalData);

    try {
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call_accepted", {
        callerId: incomingCall.from,
        signalData: pc.localDescription,
      });

      for (const candidate of pendingCandidatesRef.current) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
      pendingCandidatesRef.current = [];

      setIncomingCall(null);
      setActiveCall({
        with: incomingCall.from,
        userName: incomingCall.callerName,
        isMuted: false,
        isSpeakerOn: false,
        duration: 0,
      });
    } catch (err) {
      console.error("Failed to accept call:", err);
      cleanup();
    }
  }, [socket, incomingCall, getLocalStream, createPeerConnection, cleanup]);

  const rejectCall = useCallback(() => {
    if (!socket || !incomingCall) return;
    socket.emit("call_rejected", { callerId: incomingCall.from });
    setIncomingCall(null);
  }, [socket, incomingCall]);

  const endCall = useCallback(() => {
    if (!socket || !activeCallRef.current) return;
    socket.emit("call_ended", { targetUserId: activeCallRef.current.with });
    cleanup();
    setActiveCall(null);
    setIncomingCall(null);
  }, [socket, cleanup]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current || !activeCallRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const muted = !audioTrack.enabled;
      setActiveCall((prev) => prev ? { ...prev, isMuted: muted } : null);
      socket?.emit("call_mute", {
        targetUserId: activeCallRef.current.with,
        muted,
      });
    }
  }, [socket]);

  const toggleSpeaker = useCallback(() => {
    setActiveCall((prev) =>
      prev ? { ...prev, isSpeakerOn: !prev.isSpeakerOn } : null
    );
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data: { from: string; callerName: string; signalData: any }) => {
      if (activeCallRef.current) return;
      setIncomingCall({ from: data.from, callerName: data.callerName, signalData: data.signalData });
    };

    const handleCallAccepted = (data: { signalData: any }) => {
      if (!peerRef.current) return;
      peerRef.current.setRemoteDescription(new RTCSessionDescription(data.signalData)).catch(() => {});
      for (const candidate of pendingCandidatesRef.current) {
        peerRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
      pendingCandidatesRef.current = [];
    };

    const handleCallRejected = () => {
      toast.error("Call was declined");
      cleanup();
      setActiveCall(null);
      setIncomingCall(null);
    };

    const handleCallEnded = () => {
      toast.info("Call has ended");
      cleanup();
      setActiveCall(null);
      setIncomingCall(null);
    };

    const handleCallMute = (_data: { muted: boolean }) => {
      // Can add visual indicator if needed
    };

    const handleIceCandidate = (data: { candidate: RTCIceCandidateInit }) => {
      if (peerRef.current?.remoteDescription) {
        peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
      } else {
        pendingCandidatesRef.current.push(data.candidate);
      }
    };

    socket.on("incoming_call", handleIncomingCall);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_ended", handleCallEnded);
    socket.on("call_mute", handleCallMute);
    socket.on("call_ice_candidate", handleIceCandidate);

    return () => {
      socket.off("incoming_call", handleIncomingCall);
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_ended", handleCallEnded);
      socket.off("call_mute", handleCallMute);
      socket.off("call_ice_candidate", handleIceCandidate);
    };
  }, [socket, cleanup]);

  useEffect(() => {
    if (activeCall) {
      durationIntervalRef.current = setInterval(() => {
        setActiveCall((prev) =>
          prev ? { ...prev, duration: prev.duration + 1 } : null
        );
      }, 1000);
    }
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [activeCall ? activeCall.with : null]);

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        activeCall,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleSpeaker,
      }}
    >
      {children}
      <audio ref={remoteAudioRef} autoPlay />
      {incomingCall && (
        <IncomingCallDialog
          callerName={incomingCall.callerName}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}
      {activeCall && (
        <ActiveCallUI
          userName={activeCall.userName}
          isMuted={activeCall.isMuted}
          isSpeakerOn={activeCall.isSpeakerOn}
          duration={activeCall.duration}
          onEnd={endCall}
          onToggleMute={toggleMute}
          onToggleSpeaker={toggleSpeaker}
        />
      )}
    </CallContext.Provider>
  );
}
