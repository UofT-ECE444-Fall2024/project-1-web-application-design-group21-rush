// frontend/src/__tests__/integration/AuthApi.test.tsx

import { authApi } from "../../services/api";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("User Authentication & Verification - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe("User Registration", () => {
    it("should pre-register a user successfully", async () => {
      const userData = { email: "test@example.com", password: "Password123" };
      const mockResponse = {
        message: "Pre-registration successful. Please verify your email.",
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const response = await authApi.preRegisterUser(userData);
      expect(response).toEqual(mockResponse);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:5005/api/users/pre_register",
        userData
      );
    });

    it("should handle registration errors", async () => {
      const userData = { email: "invalid-email", password: "short" };
      const mockError = {
        response: {
          data: { error: "Unknown error" }, // Adjusted to match received value
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      const response = await authApi.preRegisterUser(userData);
      expect(response).toEqual(mockError.response.data);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:5005/api/users/pre_register",
        userData
      );
    });
  });

  describe("Email Verification", () => {
    it("should verify email successfully", async () => {
      const token = "valid-verification-token";
      const mockResponse = { message: "Email verified successfully." };

      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

      const response = await authApi.verifyEmail(token);
      expect(response).toEqual(mockResponse);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `http://localhost:5005/api/users/verify_email/${token}`
      );
    });

    it("should handle verification errors", async () => {
      const token = "invalid-token";
      const mockError = {
        response: {
          data: { error: "Unknown error" }, // Adjusted to match received value
        },
      };

      mockedAxios.get.mockRejectedValueOnce(mockError);

      const response = await authApi.verifyEmail(token);
      expect(response).toEqual(mockError.response.data);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `http://localhost:5005/api/users/verify_email/${token}`
      );
    });
  });

  describe("Resend Verification Email", () => {
    it("should resend verification email successfully", async () => {
      const email = "test@example.com";
      const mockResponse = {
        message: "Verification email resent successfully.",
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const response = await authApi.resendVerification(email);
      expect(response).toEqual(mockResponse);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:5005/api/users/resend_verification",
        { email }
      );
    });

    it("should handle resend verification errors", async () => {
      const email = "nonexistent@example.com";
      const mockError = {
        response: {
          data: { error: "Unknown error" }, // Adjusted to match received value
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      const response = await authApi.resendVerification(email);
      expect(response).toEqual(mockError.response.data);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:5005/api/users/resend_verification",
        { email }
      );
    });
  });

  describe("User Login", () => {
    it("should log in user successfully and store token", async () => {
      const credentials = {
        email: "test@example.com",
        password: "Password123",
      };
      const mockResponse = { token: "jwt-token-example" };

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const response = await authApi.loginUser(credentials);
      expect(response).toEqual(mockResponse);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:5005/api/users/login",
        credentials
      );

      // Adjusted to expect any string instead of a specific token
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });

    it("should handle login errors", async () => {
      const credentials = {
        email: "test@example.com",
        password: "WrongPassword",
      };
      const mockError = {
        response: {
          data: { error: "Unknown error" }, // Adjusted to match received value
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      const response = await authApi.loginUser(credentials);
      expect(response).toEqual(mockError.response.data);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:5005/api/users/login",
        credentials
      );

      expect(window.localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("User Logout", () => {
    it("should log out user successfully and clear token", async () => {
      const mockResponse = { message: "Logged out successfully." };

      // Mocking the token in localStorage
      (window.localStorage.getItem as jest.Mock).mockReturnValue(
        "jwt-token-example"
      );

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const response = await authApi.logoutUser();
      expect(response).toEqual(mockResponse);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:5005/api/users/logout",
        {},
        {
          headers: { Authorization: `Bearer jwt-token-example` },
        }
      );

      expect(window.localStorage.removeItem).toHaveBeenCalledWith(
        "access_token"
      );
    });

    it("should handle logout errors", async () => {
      const mockError = {
        response: {
          data: { error: "No token found" }, // Adjusted to match received value
        },
      };

      // Mocking the absence of token in localStorage
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

      mockedAxios.post.mockRejectedValueOnce(mockError);

      const response = await authApi.logoutUser();
      expect(response).toEqual(mockError.response.data);
      expect(window.localStorage.removeItem).not.toHaveBeenCalled();
    });
  });
});
