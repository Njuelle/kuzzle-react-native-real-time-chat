import React, { useState, useEffect } from "react";
import * as Font from "expo-font";
import { AppLoading } from "expo";
import {
  Root,
  Header,
  Body,
  Right,
  Icon,
  Button,
  Title,
  Container,
  Toast,
  Spinner,
} from "native-base";
import kuzzle from "./services/kuzzle";
import LoginForm from "./components/LoginForm";
import Chat from "./components/Chat";
import * as SecureStore from 'expo-secure-store';

export default function App() {
  const [isRessourcesLoaded, setIsRessourcesLoaded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
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
    } catch {
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

  const onLoginSuccess = async (username) => {
    try {
      const apiKey = await kuzzle.auth.createApiKey(`${username} API key`);
      const currentUser = {
        username,
        jwt: apiKey._source.token,
        tokenId: apiKey._id
      }

      await SecureStore.setItemAsync('persistedUser', JSON.stringify(currentUser));

      setCurrentUser(currentUser)
    } catch {
      showToast(
        "danger",
        "Sorry an error occured during authentication"
      );
    }
  };

  const checkTokenValidity = async (jwt) => {
    try {
      const verifiedToken = await kuzzle.auth.checkToken(jwt);
      return verifiedToken.valid;
    } catch {
      showToast(
        "danger",
        "Sorry an error occurred during user verification"
      );
    }
  }

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('persistedUser');
      await kuzzle.auth.deleteApiKey(currentUser.tokenId);

      setCurrentUser(null);
      setIsLoggedIn(false);
    } catch {
      showToast(
        "danger",
        "Sorry an error occurred during log-out"
      );
    }
  }

  useEffect(() => {
    if (isRessourcesLoaded) {
      handleKuzzleEvents();
      connectToKuzzle();
    }
  }, [isRessourcesLoaded]);

  useEffect(() => {
    if (connected) {
      SecureStore.getItemAsync('persistedUser').then(async (persistedUser) => {
        persistedUser = JSON.parse(persistedUser);

        if (await checkTokenValidity(persistedUser.jwt)) {
          kuzzle.jwt = persistedUser.jwt; // set the jwt on the kuzzle SDK property to automatically use it
          setCurrentUser(persistedUser)
        }

        setIsLoadingComplete(true);
      }).catch(() => setIsLoadingComplete(true));
    }
  }, [connected]);

  useEffect(() => {
    if (currentUser) {
      setIsLoggedIn(true);
    }
  }, [currentUser]);

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
    } else if (currentUser) {
      pageContent = <Chat currentUsername={currentUser.username} />;
    }

    return (
      <Root>
        <Container>
          <Header>
            <Body>
              <Title>Kuzzle Chat</Title>
            </Body>
            {isLoggedIn && <Right>
              <Button transparent onPress={logout}>
                <Icon name='log-out' />
              </Button>
            </Right>}

          </Header>
          <Container padder>{pageContent}</Container>
        </Container>
      </Root>
    );
  };

  return renderApp();
}
