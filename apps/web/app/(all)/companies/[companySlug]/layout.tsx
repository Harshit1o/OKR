import { Outlet } from "react-router";
import type { Route } from "./+types/layout";

export default function CompanyDetailLayout() {
  return <Outlet />;
}

export const meta: Route.MetaFunction = () => [{ title: "Company" }];
