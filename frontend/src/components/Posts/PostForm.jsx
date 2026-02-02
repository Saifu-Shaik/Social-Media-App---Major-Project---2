import { useState } from "react";
import API from "../../api/api";

export default function PostForm() {
  const [text, setText] = useState("");

  const submitPost = async () => {
    if (!text.trim()) return; // prevents empty posts (safe for deploy)

    await API.post("/posts", { text });
    setText("");
    window.location.reload();
  };

  return (
    <div className="mb-3">
      <textarea
        className="form-control"
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn btn-primary mt-2" onClick={submitPost}>
        Post
      </button>
    </div>
  );
}
