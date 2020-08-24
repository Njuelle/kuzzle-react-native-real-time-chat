import React, { useRef } from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";

export default function MessagesList({ messages, currentUsername }) {
  // used to reference the FlatList itself to perform scroll to end action when new messages come in
  const flatListRef = useRef();

  const renderFlatListItem = (item) => {
    return (
      <View>
        <View
          style={
            currentUsername === item.author
              ? styles.message__fromCurrentUser
              : styles.message__fromOthers
          }
        >
          <View style={styles.message__header}>
            <Text style={styles.message__author}>{item.author}</Text>
            <Text>{item.date}</Text>
          </View>
          <Text>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      style={styles.messagesList}
      data={messages}
      onContentSizeChange={() =>
        flatListRef.current.scrollToEnd({ animated: true })
      }
      renderItem={(item) => renderFlatListItem(item.item)}
      keyExtractor={(item) => item.id} // needed to the FlatList to set an unique key for each item
      ref={flatListRef}
    />
  );
}
const styles = StyleSheet.create({
  messagesList: {
    marginTop: 30,
    marginBottom: 30,
    alignSelf: "stretch",
  },
  message__fromCurrentUser: {
    backgroundColor: "#9EE493",
    alignSelf: "flex-end",
    margin: 5,
    width: 250,
    padding: 5,
    borderRadius: 5,
  },
  message__fromOthers: {
    backgroundColor: "#86BBD8",
    alignSelf: "flex-start",
    margin: 5,
    width: 250,
    padding: 5,
    borderRadius: 5,
  },
  message__header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  message__author: {
    fontWeight: "bold",
  },
});
