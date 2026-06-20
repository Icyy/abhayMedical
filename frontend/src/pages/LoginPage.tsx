import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login } from "../services/authService";

type LoginFormData = {
  phone: string;
  password: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    setIsSubmitting(true);
    try {
      await login(data.phone, data.password);
      navigate("/");
    } catch (err: any) {
      setServerError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <div className="bg-white rounded-lg border border-green-100 p-8 w-full max-w-sm">
        <h1 className="text-xl font-medium text-green-800 mb-1">Abhay Medical</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to Abhay Medical</p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Phone number</label>
            <input
              {...register("phone", { required: "Phone number is required" })}
              placeholder="e.g. 9876543210"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-500">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              placeholder="••••••••"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {serverError && <p className="text-red-500 text-xs">{serverError}</p>}

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium px-6 py-2 rounded-md transition-colors mt-2"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;