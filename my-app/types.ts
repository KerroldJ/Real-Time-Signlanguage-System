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

export type Message = {
  sender: SocketUser;
  receiver: SocketUser;
  content: string;
  timestamp: number;
};

export type OngoingChat = {
  participants: Participants;
  messages: Message[];
};

export type PeerData = {
  peerConnection: Peer.Instance;
  stream: MediaStream | undefined;
  participantUser: SocketUser;
};


