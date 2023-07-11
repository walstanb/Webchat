import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import TagPicker from "./TagPicker";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute, reactMessageRoute } from "../utils/APIRoutes";
import profile_img from "../assets/user_profile_img.png";

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    async function getAllMessages() {
      const data = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      const response = await axios.post(recieveMessageRoute, {
        sender: data._id,
        receiver: currentChat._id,
      });
      setMessages(response.data);
      setShouldScroll(true);
    }

    getAllMessages();
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );

    const res = await axios.post(sendMessageRoute, {
      sender: data._id,
      receiver: currentChat._id,
      message: msg,
    });

    socket.current.emit("send-msg", {
      sender: currentChat._id,
      receiver: data._id,
      message: msg,
      message_id: res.data.message_id,
    });

    const msgs = [...messages];
    msgs.push({
      fromSelf: true,
      message: msg,
      message_id: res.data.message_id,
    });
    setMessages(msgs);
    setShouldScroll(true);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (data) => {
        setArrivalMessage({
          fromSelf: false,
          message: data.message,
          message_id: data.message_id,
        });
        setShouldScroll(true);
      });
    }
  }, [socket]);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setShouldScroll(false);
  }, [shouldScroll]);


  const handleReact = async (messageId, emoji) => {
    try {
      const updatedMessages = messages.map((message) => {
        if (message.message_id === messageId) {
          return {
            ...message,
            tag: emoji,
          };
        }
        return message;
      });

      socket.current.emit("tag-msg", {
        sender: currentChat._id,
        message_id: messageId,
        tag: emoji,
      });

      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error reacting to message:", error);
    }
  };

  useEffect(() => {
    const handleTagReceive = (data) => {
      const updatedMessages = messages.map((message) => {
        if (message.message_id === data.message_id) {
          return {
            ...message,
            tag: data.tag,
          };
        }
        return message;
      });
      setMessages(updatedMessages);
    };

    if (socket.current) {
      socket.current.on("tag-recieve", handleTagReceive);
    }

    return () => {
      if (socket.current) {
        socket.current.off("tag-recieve", handleTagReceive);
      }
    };
  }, [socket, messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img src={profile_img} alt="" />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${message.fromSelf ? "sended" : "recieved"
                  }`}
              >
                {message.fromSelf && <TagPicker onReact={handleReact} messageId={message.message_id} />}
                <div className="reaction-bubble">
                  <p onClick={() => handleReact(message.message_id, "")}
                  >{message.tag}</p>
                </div>
                <div className="content">
                  <p>{message.message}</p>
                </div>
                {!message.fromSelf && (
                  <TagPicker onReact={handleReact} messageId={message.message_id} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .reaction-bubble{
      width: 0px;
      position: relative;
      left: 0.5rem;
      bottom: -1.5rem;
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
