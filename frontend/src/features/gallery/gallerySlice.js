import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../config/firebase";

// Firestore collection name
const GALLERY_COLLECTION = "gallery";

// Fetch all gallery images
export const fetchGalleryImages = createAsyncThunk(
  "gallery/fetchGalleryImages",
  async (_, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, GALLERY_COLLECTION),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const images = [];
      querySnapshot.forEach((doc) => {
        images.push({ id: doc.id, ...doc.data() });
      });
      return images;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add a new gallery image
export const addGalleryImage = createAsyncThunk(
  "gallery/addGalleryImage",
  async ({ file, title, description }, { rejectWithValue }) => {
    try {
      // Upload image to Firebase Storage
      const timestamp = Date.now();
      const storageRef = ref(storage, `gallery/${timestamp}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // Add image data to Firestore
      const docRef = await addDoc(collection(db, GALLERY_COLLECTION), {
        title: title || "",
        description: description || "",
        imageUrl,
        storagePath: snapshot.ref.fullPath,
        createdAt: new Date().toISOString(),
      });

      return {
        id: docRef.id,
        title: title || "",
        description: description || "",
        imageUrl,
        storagePath: snapshot.ref.fullPath,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update gallery image (title/description only)
export const updateGalleryImage = createAsyncThunk(
  "gallery/updateGalleryImage",
  async ({ id, title, description }, { rejectWithValue }) => {
    try {
      const docRef = doc(db, GALLERY_COLLECTION, id);
      await updateDoc(docRef, {
        title,
        description,
      });
      return { id, title, description };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete gallery image
export const deleteGalleryImage = createAsyncThunk(
  "gallery/deleteGalleryImage",
  async ({ id, storagePath }, { rejectWithValue }) => {
    try {
      // Delete from Storage
      if (storagePath) {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
      }

      // Delete from Firestore
      await deleteDoc(doc(db, GALLERY_COLLECTION, id));

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const gallerySlice = createSlice({
  name: "gallery",
  initialState: {
    images: [],
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch images
      .addCase(fetchGalleryImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGalleryImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload;
      })
      .addCase(fetchGalleryImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add image
      .addCase(addGalleryImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGalleryImage.fulfilled, (state, action) => {
        state.loading = false;
        state.images.unshift(action.payload);
        state.successMessage = "Image added successfully!";
      })
      .addCase(addGalleryImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update image
      .addCase(updateGalleryImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGalleryImage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.images.findIndex(
          (img) => img.id === action.payload.id
        );
        if (index !== -1) {
          state.images[index] = {
            ...state.images[index],
            title: action.payload.title,
            description: action.payload.description,
          };
        }
        state.successMessage = "Image updated successfully!";
      })
      .addCase(updateGalleryImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete image
      .addCase(deleteGalleryImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGalleryImage.fulfilled, (state, action) => {
        state.loading = false;
        state.images = state.images.filter((img) => img.id !== action.payload);
        state.successMessage = "Image deleted successfully!";
      })
      .addCase(deleteGalleryImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = gallerySlice.actions;
export default gallerySlice.reducer;
