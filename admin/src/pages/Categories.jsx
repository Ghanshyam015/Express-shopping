import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Container from "../components/Container";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaSearch,
  FaSync,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const Categories = () => {
  const { token } = useSelector((state) => state.auth);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,     // file
    imageUrl: "",    // url
  });

  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ================= FETCH =================
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/category`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ================= INPUT =================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= FILE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imageUrl: "", // url clear
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!formData.image && !formData.imageUrl && !editingCategory) {
      toast.error("Image file or Image URL is required");
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description.trim());

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (formData.imageUrl) {
        formDataToSend.append("imageUrl", formData.imageUrl);
      }

      const url = editingCategory
        ? `${import.meta.env.VITE_BACKEND_URL}/api/category/${editingCategory._id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/category`;

      const response = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingCategory ? "Category updated" : "Category created");
        fetchCategories();
        closeModal();
      } else {
        toast.error(data.message || "Failed to save category");
      }
    } catch (error) {
      console.error("Submit category error:", error);
      toast.error("Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (categoryId) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/category/${categoryId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed");
    }
  };

  // ================= MODAL =================
  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        image: null,
        imageUrl: category.image || "",
      });
      setImagePreview(category.image);
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        image: null,
        imageUrl: "",
      });
      setImagePreview("");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      image: null,
      imageUrl: "",
    });
    setImagePreview("");
  };

  // ================= FILTER =================
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= UI =================
  return (
    <Container>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Categories</h1>
          <div className="flex gap-3">
            <button
              onClick={fetchCategories}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              <FaSync />
            </button>
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-black text-white rounded"
            >
              <FaPlus /> Add
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            className="pl-10 w-full border p-2 rounded"
            placeholder="Search category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* LIST */}
        {loading ? (
          <p>Loading...</p>
        ) : filteredCategories.length === 0 ? (
          <p>No categories found</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => (
              <div
                key={cat._id}
                className="border rounded p-4 shadow-sm bg-white"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-40 object-cover rounded"
                />
                <h3 className="font-semibold mt-2">{cat.name}</h3>
                <p className="text-sm text-gray-600">
                  {cat.description || "No description"}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openModal(cat)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <div className="bg-white rounded w-full max-w-md p-6">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {editingCategory ? "Edit" : "Add"} Category
                </h2>
                <button onClick={closeModal}>
                  <IoMdClose size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Category Name"
                  className="w-full border p-2 rounded"
                />

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="w-full border p-2 rounded"
                />

                <input type="file" accept="image/*" onChange={handleImageChange} />

                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    handleInputChange(e);
                    setImagePreview(e.target.value);
                    setFormData((prev) => ({ ...prev, image: null }));
                  }}
                  placeholder="Or paste image URL"
                  className="w-full border p-2 rounded"
                />

                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="w-32 h-32 object-cover rounded"
                  />
                )}

                <button
                  disabled={submitting}
                  className="w-full bg-black text-white py-2 rounded"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Categories;
