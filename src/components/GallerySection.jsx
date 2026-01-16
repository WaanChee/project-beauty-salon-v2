import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  fetchGalleryImages,
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  clearMessages,
} from "../features/gallery/gallerySlice";
import { useAdminStatus } from "../hooks/useAdminStatus";

export default function GallerySection() {
  const dispatch = useDispatch();
  const { images, loading, error, successMessage } = useSelector(
    (state) => state.gallery
  );

  // Check if user is admin using custom hook
  const { isAdmin } = useAdminStatus();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Form states
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filePreview, setFilePreview] = useState(null);

  // Fetch images on component mount
  useEffect(() => {
    dispatch(fetchGalleryImages());
  }, [dispatch]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle add image
  const handleAddImage = async () => {
    if (!file) {
      alert("Please select an image!");
      return;
    }

    await dispatch(addGalleryImage({ file, title, description }));
    handleCloseAddModal();
  };

  // Handle edit image
  const handleEditImage = async () => {
    if (!selectedImage) return;

    await dispatch(
      updateGalleryImage({
        id: selectedImage.id,
        title,
        description,
      })
    );
    handleCloseEditModal();
  };

  // Handle delete image
  const handleDeleteImage = async (image) => {
    if (
      window.confirm(
        "Are you sure you want to delete this image? This action cannot be undone."
      )
    ) {
      await dispatch(
        deleteGalleryImage({ id: image.id, storagePath: image.storagePath })
      );
    }
  };

  // Handle open image modal (enlarged view)
  const handleOpenImageModal = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (image) => {
    setSelectedImage(image);
    setTitle(image.title);
    setDescription(image.description);
    setShowEditModal(true);
  };

  // Handle close modals
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFile(null);
    setTitle("");
    setDescription("");
    setFilePreview(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedImage(null);
    setTitle("");
    setDescription("");
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  return (
    <Container fluid="lg" className="my-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Gallery</h2>
              <p className="text-muted">
                Explore our salon's beautiful transformations
              </p>
            </div>
            {isAdmin && (
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                + Add Image
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Messages */}
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => dispatch(clearMessages())}
        >
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => dispatch(clearMessages())}
        >
          {successMessage}
        </Alert>
      )}

      {/* Loading state */}
      {loading && images.length === 0 && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading gallery...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && images.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No images in the gallery yet.</p>
          {isAdmin && (
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Add Your First Image
            </Button>
          )}
        </div>
      )}

      {/* Gallery Grid - Larger cards */}
      {images.length > 0 && (
        <Row className="g-4">
          {images.map((image) => (
            <Col key={image.id} xs={12} sm={12} md={6} lg={4}>
              <Card
                className="h-100 shadow-sm gallery-card"
                style={{
                  cursor: "pointer",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)";
                }}
                onClick={() => handleOpenImageModal(image)}
              >
                <Card.Img
                  variant="top"
                  src={image.imageUrl}
                  alt={image.title}
                  style={{
                    height: "350px",
                    objectFit: "cover",
                  }}
                />
                <Card.Body>
                  {image.title && (
                    <Card.Title style={{ fontSize: "1.25rem" }}>
                      {image.title}
                    </Card.Title>
                  )}
                  {image.description && (
                    <Card.Text className="text-muted">
                      {image.description}
                    </Card.Text>
                  )}
                  {isAdmin && (
                    <div className="d-flex gap-2 mt-3">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(image);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add Image Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Image File *</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {filePreview && (
                <div className="mt-3">
                  <img
                    src={filePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter image title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter image description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddImage}
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Uploading...
              </>
            ) : (
              "Add Image"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Image Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedImage && (
            <>
              <div className="mb-3">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter image title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter image description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEditImage}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Full-Size Image Modal (Lightbox) */}
      <Modal
        show={showImageModal}
        onHide={handleCloseImageModal}
        centered
        size="lg"
        fullscreen="lg-down"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedImage?.title || "Gallery Image"}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "0", background: "#f8f9fa" }}>
          {selectedImage && (
            <div style={{ textAlign: "center" }}>
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                style={{
                  width: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
        </Modal.Body>
        {selectedImage?.description && (
          <Modal.Footer style={{ justifyContent: "flex-start" }}>
            <div>
              <strong>Description:</strong> {selectedImage.description}
            </div>
          </Modal.Footer>
        )}
      </Modal>
    </Container>
  );
}
