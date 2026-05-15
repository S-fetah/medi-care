# Medi-Care API Integration Guide

This guide explains how to correctly send requests from your frontend (specifically React Native) to the Medi-Care backend to avoid validation and parsing errors.

> [!WARNING]
> A common mistake in React Native is manually setting the `Content-Type: multipart/form-data` header when using `fetch` or `axios` with `FormData`. **Do not do this.** The network client must set it automatically so it can attach the proper boundary string.

---

## Authentication Endpoints

### 1. User Signup (`POST /api/auth/signup`)

Because doctors need to upload a certificate, this endpoint expects `multipart/form-data` (not JSON). 

**Required Fields:**
*   `fullName` (string)
*   `email` (string, valid email format)
*   `password` (string, min 6 chars)
*   `userType` (string, either `"user"` or `"doctor"`)

**Required Fields (if `userType` is `"doctor"`):**
*   `speciality` (string)
*   `certificate` (File upload)

#### React Native Example

When dealing with files in React Native, the file object appended to `FormData` must have exactly these three properties: `uri`, `name`, and `type`.

```javascript
const handleSignup = async (selectedFileUri, mimeType, fileName) => {
  // 1. Initialize FormData
  const formData = new FormData();
  
  // 2. Append text fields
  formData.append("fullName", "Dr. Jane Smith");
  formData.append("email", "jane.smith@example.com");
  formData.append("password", "securepassword123");
  formData.append("userType", "doctor");
  formData.append("speciality", "Cardiology");

  // 3. Append the file (Only if doctor)
  // Make sure the file object has uri, name, and type
  formData.append("certificate", {
    uri: selectedFileUri,       // e.g., 'file:///data/user/0/...' or 'content://...'
    name: fileName,             // e.g., 'certificate.pdf'
    type: mimeType              // e.g., 'application/pdf' or 'image/jpeg'
  });

  try {
    const response = await fetch("http://YOUR_BACKEND_IP:3000/api/auth/signup", {
      method: "POST",
      // IMPORTANT: Let fetch automatically set the Content-Type to handle the boundary
      headers: {
        "Accept": "application/json",
      },
      body: formData,
    });

    const data = await response.json();
    console.log("Response:", data);
    
  } catch (error) {
    console.error("Signup request failed:", error);
  }
};
```

---

### 2. User Login (`POST /api/auth/login`)

This endpoint expects standard JSON format.

**Required Fields:**
*   `email` (string)
*   `password` (string)

#### React Native Example

```javascript
const handleLogin = async () => {
  try {
    const response = await fetch("http://YOUR_BACKEND_IP:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email: "jane.smith@example.com",
        password: "securepassword123",
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Store this token securely (e.g., using Expo SecureStore or AsyncStorage)
      console.log("Access Token:", data.accessToken);
    } else {
      console.error("Login Error:", data.message);
    }
  } catch (error) {
    console.error("Network request failed:", error);
  }
};
```

---

### 3. Making Protected Requests (`GET /api/protected`)

When requesting data from an endpoint protected by `authMiddleware`, you must include the `accessToken` you received during login in the `Authorization` header.

#### React Native Example

```javascript
const fetchProtectedData = async (accessToken) => {
  try {
    const response = await fetch("http://YOUR_BACKEND_IP:3000/api/protected", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Pass the token as a Bearer token
        "Authorization": `Bearer ${accessToken}`
      },
    });

    const data = await response.json();
    console.log("Protected Data:", data);
    
  } catch (error) {
    console.error("Request failed:", error);
  }
};
```
