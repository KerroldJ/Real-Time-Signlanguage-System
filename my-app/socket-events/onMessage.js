// socket-events/onMessage.js
import { io, onlineUsers } from "../server.js";

const onMessage = (data) => {
    const { senderId, message, ongoingCall } = data;

    // Validate sender
    const sender = onlineUsers.find((user) => user.userId === senderId);
    if (!sender) {
        io.to(sender.socketId).emit("messageError", {
            error: "Sender not online",
        });
        return;
    }

    // Validate ongoingCall and participants
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

    // Determine recipient
    const recipient = senderId === caller.userId ? receiver : caller;
    const recipientOnline = onlineUsers.find((user) => user.userId === recipient.userId);

    if (!recipientOnline) {
        io.to(sender.socketId).emit("messageError", {
            error: "Recipient not online",
        });
        return;
    }

    // Send message to recipient
    io.to(recipientOnline.socketId).emit("receiveMessage", {
        senderId,
        message,
        timestamp: new Date().toISOString(),
    });
};

export default onMessage;