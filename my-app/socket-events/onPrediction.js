export default function onPrediction(socket) {
    return (data) => {
        console.log("Received gesture prediction:", data);
        socket.broadcast.emit("prediction", data);
    };
}