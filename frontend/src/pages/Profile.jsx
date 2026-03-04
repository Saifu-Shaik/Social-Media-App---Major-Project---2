import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

export default function Profile() {
  const [popup, setPopup] = useState("");
  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => {
        setPopup("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [popup]);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(true);

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
      setPopup("Failed to load profile");
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
      setPopup("");

      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", bio);
      if (file) formData.append("profilePic", file);

      await API.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPopup("✅ Profile updated successfully");
      fetchProfile();
    } catch (err) {
      setPopup(err.response?.data?.message || "Update failed");
    }
  };

  const deletePost = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`);
      setPopup("🗑️ Post deleted successfully");
      fetchProfile();
    } catch (err) {
      setPopup("Failed to delete post");
    }
  };

  const unfollowUser = async (id) => {
    try {
      await API.post(`/users/unfollow/${id}`);
      fetchProfile();
    } catch (err) {
      setPopup("Unfollow failed");
    }
  };

  if (loading) {
    return <h5 className="text-center mt-5">Loading profile...</h5>;
  }

  if (!user) {
    return <h5 className="text-danger text-center">Profile not found</h5>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        {/* LEFT PROFILE CARD */}
        <div className="col-md-4">
          <div className="card p-4">
            <h5 className="mb-3">Your Profile Details 👤 :</h5>

            {popup && (
              <div className="alert alert-info text-center">{popup}</div>
            )}

            <div className="text-center mb-3">
              <div
                style={{
                  width: "170px",
                  height: "170px",
                  margin: "0 auto",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "4px solid #e4e6eb",
                  background: "#f0f2f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={
                    preview
                      ? preview
                      : user.profilePic ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
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

        {/* RIGHT SECTION */}
        <div className="col-md-8">
          {/* FOLLOWERS */}
          <div className="card mb-3">
            <div className="card-header">
              <b>Followers ({user.followers?.length || 0}) 👥</b>
            </div>

            <div className="card-body">
              {user.followers?.length === 0 ? (
                <p className="text-muted">No followers yet 🥺</p>
              ) : (
                user.followers.map((f) => (
                  <div key={f._id} className="mb-2">
                    <Link
                      to={`/user/${f._id}`}
                      className="fw-bold text-primary text-decoration-none"
                    >
                      {f.username}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FOLLOWING */}
          <div className="card mb-4">
            <div className="card-header">
              <b>Following ({user.following?.length || 0}) 👥</b>
            </div>

            <div className="card-body">
              {user.following?.length === 0 ? (
                <p className="text-muted">Not following anyone 🥺</p>
              ) : (
                user.following.map((f) => (
                  <div
                    key={f._id}
                    className="d-flex justify-content-between align-items-center mb-2"
                  >
                    <Link
                      to={`/user/${f._id}`}
                      className="fw-bold text-primary text-decoration-none"
                    >
                      {f.username}
                    </Link>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => unfollowUser(f._id)}
                    >
                      Unfollow
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* POSTS */}
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
