import { Suspense } from "react";
import EmailVerifyClient from "./EmailVerifyClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerifyClient />
    </Suspense>
  );
}