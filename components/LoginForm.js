import React, { useState, useEffect } from "react";
import {
  Form,
  Item,
  Input,
  Label,
  Button,
  Text,
  Toast,
  Content,
} from "native-base";
import kuzzle from "../services/kuzzle";

export default function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState(null);
  const [isUsernameEmpty, setIsUsernameEmpty] = useState(false);

  const [password, setPassword] = useState(null);
  const [isPasswordEmpty, setIsPasswordEmpty] = useState(false);

  const [canPerformLogin, setCanPerformLogin] = useState(false);

  const validateForm = async () => {
    let isFormValid = true;
    setIsUsernameEmpty(false);
    setIsPasswordEmpty(false);

    if (!username) {
      setIsUsernameEmpty(true);
      isFormValid = false;
    }

    if (!password) {
      setIsPasswordEmpty(true);
      isFormValid = false;
    }

    setCanPerformLogin(isFormValid);
  };

  const performLogin = async () => {
    let jwt = null;
    console.log("perform login");
    try {
      jwt = await kuzzle.auth.login("local", {
        username,
        password,
      });

      onLoginSuccess(jwt, username);
    } catch (err) {
      showToast("danger", err.message);
    }
  };

  const showToast = (type, message) => {
    return Toast.show({
      text: message,
      duration: 5000,
      type: type,
    });
  };

  useEffect(() => {
    if (canPerformLogin) {
      performLogin();
    }
  }, [canPerformLogin]);

  return (
    <Content>
      <Form>
        <Item floatingLabel error={isUsernameEmpty}>
          <Label>Username</Label>
          <Input onChangeText={(username) => setUsername(username)} />
        </Item>
        <Item floatingLabel error={isPasswordEmpty}>
          <Label>Password</Label>
          <Input
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
        </Item>
        <Button
          block
          onPress={validateForm}
          style={{
            marginTop: 32,
          }}
        >
          <Text>Login</Text>
        </Button>
      </Form>
    </Content>
  );
}
