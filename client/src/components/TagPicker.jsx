import React, { useState } from "react";
import { BiHeart } from "react-icons/bi";
import styled from "styled-components";

export default function TagPicker({ onReact, messageId }) {
    const [showEmojiOptions, setShowEmojiOptions] = useState(false);

    const handleEmojiClick = (emoji) => {
        onReact(messageId, emoji);
        setShowEmojiOptions(false);
    };

    return (
        <Container className="tag-picker" onClick={() => setShowEmojiOptions(!showEmojiOptions)}>
            {!showEmojiOptions && <BiHeart />}
            {showEmojiOptions && (
                <div className="emoji-options">
                    <a onClick={() => handleEmojiClick("❤️")}>❤️ </a>
                    <a onClick={() => handleEmojiClick("👍")}>👍 </a>
                    <a onClick={() => handleEmojiClick("👎")}>👎 </a>
                    <a onClick={() => handleEmojiClick("😊")}>😊 </a>
                    <a onClick={() => handleEmojiClick("😂")}>😂 </a>
                </div>
            )}
        </Container>
    );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.3rem;
  margin: 0.5rem;
  border-radius: 1rem;
  background-color: #9a86f3;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  &:hover {
    opacity: 1;
  }
`;
