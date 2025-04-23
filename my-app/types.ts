import { User } from "@clerk/nextjs/server";
import Peer from "simple-peer";

export type SocketUser = {
  userId: string;
  socketId: string;
  profile: User;
};

export type OngoingCall = {
  participants: Participants;
  isRinging: boolean;
};

export type Participants = {
  caller: SocketUser;
  receiver: SocketUser;
};

export type PeerData = {
  peerConnection: Peer.Instance;
  stream: MediaStream | undefined;
  participantUser: SocketUser;
};

export type MessageData = {
  senderId: string;
  message: string;
  ongoingCall: OngoingCall;
};

export type ReceivedMessage = {
  senderId: string;
  message: string;
  timestamp: string;
};

export type MessageError = {
  error: string;
};