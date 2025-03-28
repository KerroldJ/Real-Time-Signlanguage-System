import CallNotification from "@/components/CallNotification";
import VideoCall from "@/components/VideoCall";
import ListOnlineUsers from "@/components/ListOnlineUsers";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-between">
      <ListOnlineUsers />
      <CallNotification />
      <VideoCall />
    </div>
  );
}
