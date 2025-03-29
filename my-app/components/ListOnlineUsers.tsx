'use client'

import { useSocket } from "@/context/SocketContext";
import { useUser } from "@clerk/nextjs";
import Avatar from "./layout/Avatar";

const ListOnlineUsers = () => {
  const { user } = useUser();
  const { onlineUsers, handleCall } = useSocket()

  return (
    <div className="flex gap-4 w-full items-center pb-2">
      {onlineUsers && onlineUsers.map(onlineUser => {
        if (onlineUser.profile.id === user?.id) return null
          return <div className="flex flex-col items-center w-[200px] h-[100px] border-2 border-slate-400 mt-4 gap-1 rounded-lg">
                    <div key={onlineUser.profile.id}  className="flex flex-col items-center mt-4 cursor-pointer" onClick={() => handleCall(onlineUser)}>
                          <Avatar src={onlineUser.profile.imageUrl} />
                          <div className="text-sm">{onlineUser.profile.fullName}</div>
                    </div>
                </div>
      })}
    </div>
  );
}

export default ListOnlineUsers;