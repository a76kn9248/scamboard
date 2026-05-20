import Link from "next/link";
import ShameMessage from "@/components/ShameMessage";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <span className="text-8xl mb-6 block">&#x2620;</span>
        <h1 className="text-4xl font-black text-[var(--red-primary)] mb-4">
          THIS PAGE GOT RUGGED
        </h1>
        <p className="text-lg text-[var(--foreground-muted)] mb-6">
          Looks like someone pulled the rug on this URL.
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mb-8">
          <ShameMessage />
        </div>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link href="/submit" className="btn-secondary">
            Report a Scammer
          </Link>
        </div>
      </div>
    </div>
  );
}
