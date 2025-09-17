// Wykorzystujemy tylko wbudowane, stabilne API Deno
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

interface Message {
    id: number;
    color: string;
    user: string;
    text: string;
}

let messages: Message[] = [];

let nextId = messages.length + 1;
const clients = new Set<WebSocket>();

const getRandomColor = (): string => {
    const colors = [
        "#0000FF",
        "#FF7F50",
        "#1E90FF",
        "#00FF7F",
        "#9ACD32",
        "#008000",
        "#FF4500",
        "#FF0000",
        "#DAA520",
        "#FF69B4",
        "#5F9EA0",
        "#2E8B57",
        "#D2691E",
        "#8A2BE2",
        "#B22222",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

const broadcastMessages = (): void => {
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(messages));
        }
    });
};

const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    console.log(`${method} to ${path} url = ${url}`)
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    // Obsługa połączenia WebSocket
    if (path === "/ws" && req.headers.get("upgrade") === "websocket") {
        const { response, socket } = Deno.upgradeWebSocket(req);

        socket.onopen = () => {
            console.log("Klient WebSocket podłączony.");
            clients.add(socket);
            broadcastMessages(); // Wysyłamy całą listę wiadomości do nowego klienta
        };
        socket.onclose = () => {
            clients.delete(socket);
            console.log("Klient WebSocket rozłączony.");
        };
        socket.onerror = (e) => console.error("Błąd WebSocket:", e);

        return response;
    }
    if (path == "/widget" && method == "GET") {
        const filePath = new URL("index.html", import.meta.url);
        try {
            const file = await Deno.readFile(filePath);
            return new Response(file, {
                headers: { "Content-Type": "text/html" },
            });
        } catch (error) {
            console.log(error)
            return new Response("Nie znaleziono html", {
                status: 404,
            });
        }
    }
     if (path == "/js" && method == "GET") {
        const filePath = new URL("assets/index-CS8tiHfZ.js", import.meta.url);
        try {
            const file = await Deno.readFile(filePath);
            return new Response(file, {
                headers: { "Content-Type": "text/javascript" },
            });
        } catch (error) {
            console.log(error)
            return new Response("Nie znaleziono js", {
                status: 404,
            });
        }
     }
      if (path == "/css" && method == "GET") {
         const filePath = new URL("assets/index-DVo5xUOy.css", import.meta.url);
        try {
            const file = await Deno.readFile(filePath);
            return new Response(file, {
                headers: { "Content-Type": "text/css" },
            });
        } catch (error) {
            console.log(error)
            return new Response("Nie znaleziono css", {
                status: 404,
            });
        }
      }
      if (path == "/wruzby" && method == "GET") {
         const filePath = new URL("wrurzby.gif", import.meta.url);
        try {
            const file = await Deno.readFile(filePath);
            return new Response(file, {
                headers: { "Content-Type": "image/gif" },
            });
        } catch (error) {
            console.log(error)
            return new Response("Nie znaleziono gif", {
                status: 404,
            });
        }
      }
      if (path == "/json" && method == "GET") {
         const filePath = new URL("/data/users.json", import.meta.url);
        try {
            const file = await Deno.readFile(filePath);
            return new Response(file, {
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.log(error)
            return new Response("Nie znaleziono json", {
                status: 404,
            });
        }
      }
    if (path === "/api/messages" && method === "POST") {
        try {
            const { user, text } = await req.json();
            if (!user || !text) {
                return new Response("User and text are required.", {
                    status: 400,
                    headers: corsHeaders,
                });
            }
            const newMessage: Message = {
                id: nextId++,
                color: getRandomColor(),
                user: user,
                text: text,
            };
            messages.push(newMessage);
            broadcastMessages();

            return Response.json(newMessage, {
                status: 201,
                headers: corsHeaders,
            });
        } catch (e) {
            return new Response("Invalid JSON format.", {
                status: 400,
                headers: corsHeaders,
            });
        }
    }

    // GET: Zwraca wszystkie wiadomości (dla klientów, którzy nie używają WS)
    if (path === "/api/messages" && method === "GET") {
        return Response.json(messages, { headers: corsHeaders });
    }
    if (path.startsWith("/api/messages/by-user/") && method === "DELETE") {
        const userToDelete = path.split("/").pop();
        if (!userToDelete) {
            return new Response("User is required.", {
                status: 400,
                headers: corsHeaders,
            });
        }
        const initialLength = messages.length;
        messages = messages.filter((msg) => msg.user !== userToDelete);
        if (messages.length < initialLength) {
            broadcastMessages();
            return new Response(
                `Messages for user "${userToDelete}" deleted.`,
                { status: 200, headers: corsHeaders },
            );
        } else {
            return new Response(
                `Messages for user "${userToDelete}" not found.`,
                { status: 404, headers: corsHeaders },
            );
        }
    }

    if (path === "/api/messages/oldest" && method === "DELETE") {
        if (messages.length > 0) {
            const oldestMessage = messages.reduce((
                prev,
                curr,
            ) => (prev.id < curr.id ? prev : curr));
            const idToDelete = oldestMessage.id;
            messages = messages.filter((msg) => msg.id !== idToDelete);
            broadcastMessages();
            return new Response(
                `Oldest message with ID ${idToDelete+1} deleted.`,
                { status: 200, headers: corsHeaders },
            );
        } else {
            return new Response("No messages to delete.", {
                status: 404,
                headers: corsHeaders,
            });
        }
    }
    // DELETE: Usuwa wiadomość po ID i rozsyła całą listę
    if (path.startsWith("/api/messages/") && method === "DELETE") {
        const idString = path.split("/").pop();
        const id = parseInt(idString as string);

        if (isNaN(id)) {
            return new Response("Invalid ID.", {
                status: 400,
                headers: corsHeaders,
            });
        }

        const initialLength = messages.length;
        messages = messages.filter((msg) => msg.id !== id);

        if (messages.length < initialLength) {
            broadcastMessages();
            return new Response(`Message with ID ${id} deleted.`, {
                status: 200,
                headers: corsHeaders,
            });
        } else {
            return new Response(`Message with ID ${id} not found.`, {
                status: 404,
                headers: corsHeaders,
            });
        }
    }
     if (path.startsWith("/nabin") && method == "GET") {
         const filePath = new URL("assets/nabin.png", import.meta.url);
        try {
            const file = await Deno.readFile(filePath);
            return new Response(file, {
                headers: { "Content-Type": "image/png" },
            });
        } catch (error) {
            console.log(error)
            return new Response("Nie znaleziono gif", {
                status: 404,
            });
        }
    }
    if (path == "/" && method == "get"){
        const filePath = new URL("nabin.html", import.meta.url);
        try {
            const file = await Deno.readFile(filePath);
            return new Response(file, {
                headers: { "Content-Type": "text/html" },
            });
        } catch (error) {
            console.log(error)
            return new Response("Nie znaleziono html", {
                status: 404,
            });
        }
    }

    

    return new Response("Not Found", { status: 404, headers: corsHeaders });
};

console.log("Serwer API Deno działa na porcie 8000.");
console.log(
    "Endpointy HTTP: /api/messages, /api/messages/:id, /api/messages/by-user/:user, /api/messages/oldest",
);
console.log("WebSocket: /ws");

serve(handler, { port: 80, hostname: "::" });
