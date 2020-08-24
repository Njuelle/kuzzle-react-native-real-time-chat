import React, { useState, useEffect } from "react";
import * as Font from "expo-font";
import { AppLoading } from "expo";
import {
  Root,
  Header,
  Body,
  Title,
  Container,
  Toast,
  Text,
  Spinner,
} from "native-base";
import kuzzle from "./services/kuzzle";
import LoginForm from "./components/LoginForm";
import Chat from "./components/Chat";

export default function App() {
  const [isRessourcesLoaded, setIsRessourcesLoaded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [jwt, setJwt] = useState(null);
  const [username, setUsername] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const showToast = (type, message) => {
    return Toast.show({
      text: message,
      duration: 8000,
      type: type,
    });
  };

  const loadRessources = async () => {
    await Promise.all([
      Font.loadAsync({
        Roboto: require("native-base/Fonts/Roboto.ttf"),
        Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      }),
    ]);
  };

  const onLoadingError = () => {
    showToast(
      "danger",
      "Sorry an error occured while the application is loading"
    );
  };

  const connectToKuzzle = async () => {
    try {
      await kuzzle.connect();
    } catch (err) {
      console.log(err);
      setConnected(false);
      showToast(
        "danger",
        "It looks like you're not connected to Kuzzle Mobile. Trying to reconnect..."
      );
    }
  };

  const handleKuzzleEvents = () => {
    kuzzle.on("connected", () => {
      setConnected(true);
    });

    kuzzle.on("reconnected", () => {
      setConnected(true);
    });

    kuzzle.on("disconnected", () => {
      setConnected(false);

      showToast(
        "danger",
        "It looks like you're not connected to Kuzzle Mobile. Trying to reconnect..."
      );
    });
  };

  const onLoginSuccess = (jwt, username) => {
    setJwt(jwt);
    setUsername(username);
  };

  useEffect(() => {
    if (isRessourcesLoaded) {
      handleKuzzleEvents();
      connectToKuzzle();
    }
  }, [isRessourcesLoaded]);

  useEffect(() => {
    if (connected) {
      setIsLoadingComplete(true);
    }
  }, [connected]);

  useEffect(() => {
    if (jwt && username) {
      setIsLoggedIn(true);
    }
  }, [jwt, username]);

  const renderApp = () => {
    if (!isRessourcesLoaded) {
      return (
        <AppLoading
          startAsync={loadRessources}
          onError={onLoadingError}
          onFinish={() => setIsRessourcesLoaded(true)}
        />
      );
    }

    let pageContent = null;

    if (!isLoadingComplete && isRessourcesLoaded) {
      pageContent = <Spinner />;
    } else if (!isLoggedIn) {
      pageContent = <LoginForm onLoginSuccess={onLoginSuccess} />;
    } else {
      pageContent = <Chat currentUsername={username} />;
    }

    return (
      <Root>
        <Container>
          <Header>
            <Body>
              <Title>Kuzzle Chat</Title>
            </Body>
          </Header>
          <Container padder>{pageContent}</Container>
        </Container>
      </Root>
    );
  };

  return renderApp();
}
