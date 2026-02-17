import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get("/users/profile");
      setUser(res.data);
      setUsername(res.data.username || "");
      setBio(res.data.bio || "");

      const postRes = await API.get(`/posts/user/${res.data._id}`);
      setPosts(postRes.data || []);

      setFile(null);
      setPreview(null);
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const updateProfile = async () => {
    try {
      setError("");

      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", bio);
      if (file) formData.append("profilePic", file);

      await API.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Profile updated successfully");
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await API.delete(`/posts/${postId}`);
      alert("🗑️ Post deleted successfully");
      fetchProfile();
    } catch {
      alert("Failed to delete post");
    }
  };

  const unfollowUser = async (id) => {
    try {
      await API.post(`/users/unfollow/${id}`);
      fetchProfile();
    } catch (err) {
      console.error("Unfollow failed", err);
    }
  };

  if (loading) return <h5 className="text-center mt-5">Loading profile...</h5>;
  if (!user)
    return <h5 className="text-danger text-center">Profile not found</h5>;

  return (
    <div className="container mt-4">
      <div className="row">
        {/* LEFT PROFILE */}
        <div className="col-md-4">
          <div className="card p-4">
            <h5 className="mb-3">Your Profile Details 👤 :</h5>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="text-center mb-3">
              <img
                src={
                  preview
                    ? preview
                    : user.profilePic || "https://via.placeholder.com/120"
                }
                width="120"
                height="120"
                className="rounded-circle"
                style={{ objectFit: "cover" }}
                alt="profile"
              />
            </div>

            <input
              className="form-control mb-2"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="form-control mb-2 mt-2"
              value={user.email}
              disabled
            />

            <textarea
              className="form-control mb-2 mt-2"
              placeholder="Tell About Yourself!!"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <input
              type="file"
              className="form-control mb-3"
              accept="image/*"
              onChange={(e) => {
                const selected = e.target.files[0];
                if (!selected) return;

                setFile(selected);
                setPreview(URL.createObjectURL(selected));
              }}
            />

            <button className="btn btn-primary w-100" onClick={updateProfile}>
              Save Profile
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-md-8">
          <h5>Your Posts 📝:</h5>

          {posts.length === 0 && (
            <p className="text-muted mt-3">No posts yet 📝</p>
          )}

          <div className="row">
            {posts.map((p) => (
              <div key={p._id} className="col-md-6 mb-3">
                <div className="card h-100">
                  {p.image && (
                    <img src={p.image} className="card-img-top" alt="post" />
                  )}

                  <div className="card-body">
                    <p>{p.text}</p>

                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        ❤️ {p.likes?.length || 0} likes
                      </small>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deletePost(p._id)}
                      >
                        Delete 🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
