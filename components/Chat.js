import React, { useState, useEffect } from "react";
import { Container, Toast, Input, Form, Item, Label, Text } from "native-base";
import kuzzle from "../services/kuzzle";
import MessagesList from "./MessagesList";

export default function Chat({ currentUsername }) {
  const [messages, setMessages] = useState([]);
  const [messagesFetched, setMessagesFetched] = useState(false);
  const [newMessage, setNewMessage] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const messageInputRef = React.createRef();

  const fetchMessages = async () => {
    try {
      // send search request with the kuzzle-sdk
      const results = await kuzzle.document.search(
        "messaging-app", // index
        "messages", // collection
        { sort: { "_kuzzle_info.createdAt": { order: "asc" } } }, // query body
        { size: 100 } // options
      );

      const fetchedMessages = results.hits.map((message) =>
        formatMessage(message)
      );

      setMessages(fetchedMessages);
      setMessagesFetched(true);
    } catch {
      console.log(err);
      showToast(
        "danger",
        "It looks like there is an error while fetching messages..."
      );
    }
  };

  const formatMessage = (message) => {
    return {
      id: message._id,
      author: message._source.author,
      content: message._source.content,
      date: new Date(message._source._kuzzle_info.createdAt).toLocaleString(),
    };
  };

  const showToast = (type, message) => {
    return Toast.show({
      text: message,
      duration: 8000,
      type: type,
    });
  };

  const sendMessage = async () => {
    try {
      await kuzzle.document.create("messaging-app", "messages", {
        content: newMessage,
        author: currentUsername,
      });
      setNewMessage(null);
    } catch {
      showToast(
        "danger",
        "It looks like there is an error while sending a message..."
      );
    }
  };

  const subscribeToMessages = async () => {
    try {
      const roomId = await kuzzle.realtime.subscribe(
        "messaging-app",
        "messages",
        {},
        async (notification) => {
          if (
            notification.type !== "document" ||
            notification.action !== "create"
          ) {
            return;
          }
          setMessages([...messages, formatMessage(notification.result)]);
        }
      );

      setRoomId(roomId);
    } catch {
      showToast(
        "danger",
        "It looks like there is an error with the real-time messages subscription..."
      );
    }
  };

  useEffect(() => {
    if (!messagesFetched) {
      fetchMessages();
    }

    if (messagesFetched && !roomId) {
      subscribeToMessages();
    }
  }, [messagesFetched, roomId]);

  return (
    <Container style={{ flex: 1 }}>
      <Container style={{ flex: 1 }}>
        <MessagesList messages={messages} currentUsername={currentUsername} />
      </Container>
      <Form>
        <Item floatingLabel>
          <Label>Your message</Label>
          <Input
            const={messageInputRef}
            onChangeText={(message) => setNewMessage(message)}
            onSubmitEditing={() => sendMessage()}
            value={newMessage}
          />
        </Item>
      </Form>
    </Container>
  );
}
