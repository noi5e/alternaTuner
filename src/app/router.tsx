import { createBrowserRouter, Navigate } from "react-router";

import { scaleLoader } from "@/features/scales/loaders";

import { ScalesLayout } from "@/features/scales/ScalesLayout.tsx";
import { AppLayout } from "@/app/AppLayout.tsx";
import { LoginForm } from "@/features/auth/LoginForm.tsx";
import { NewScalePage } from "@/features/scales/NewScalePage";
import { ScalePage } from "@/features/scales/ScalePage";
import { ScaleLoadError } from "@/features/scales/ScaleLoadError";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/login", element: <LoginForm /> },
      {
        element: <ScalesLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/scales/new" replace />,
          },
          {
            path: "scales",
            children: [
              {
                index: true,
                element: <Navigate to="/scales/new" replace />,
              },
              {
                path: "new",
                element: <NewScalePage />,
              },
              {
                path: ":scaleSlug",
                loader: scaleLoader,
                element: <ScalePage />,
                errorElement: <ScaleLoadError />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
