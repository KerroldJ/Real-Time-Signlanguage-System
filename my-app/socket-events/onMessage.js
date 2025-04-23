import { io, onlineUsers } from "../server.js";

const onMessage = (data) => {
    const { senderId, message, ongoingCall } = data;
    const sender = onlineUsers.find((user) => user.userId === senderId);
    if (!sender) {
        io.to(sender.socketId).emit("messageError", {
            error: "Sender not online",
        });
        return;
    }

    if (!ongoingCall || !ongoingCall.participants) {
        io.to(sender.socketId).emit("messageError", {
            error: "No active call",
        });
        return;
    }

    const { caller, receiver } = ongoingCall.participants;
    if (senderId !== caller.userId && senderId !== receiver.userId) {
        io.to(sender.socketId).emit("messageError", {
            error: "Sender not in this call",
        });
        return;
    }

    const recipient = senderId === caller.userId ? receiver : caller;
    const recipientOnline = onlineUsers.find((user) => user.userId === recipient.userId);

    if (!recipientOnline) {
        io.to(sender.socketId).emit("messageError", {
            error: "Recipient not online",
        });
        return;
    }

    io.to(recipientOnline.socketId).emit("receiveMessage", {
        senderId,
        message,
        timestamp: new Date().toISOString(),
    });
};

export default onMessage;