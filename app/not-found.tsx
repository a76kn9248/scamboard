import Link from "next/link";
import ShameMessage from "@/components/ShameMessage";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <span className="text-8xl mb-6 block">{"\u2620"}</span>
        <h1 className="font-display font-black text-4xl text-[var(--red)] mb-4 tracking-tight">
          THIS PAGE GOT RUGGED
        </h1>
        <p className="text-lg text-[var(--text-muted)] mb-6 leading-relaxed">
          Looks like someone pulled the rug on this URL.
          <br />
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mb-8">
          <ShameMessage />
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">
            {"\u2190"} Back to Home
          </Link>
          <Link href="/submit" className="btn-secondary">
            {"\u{1F6A9}"} Report a Scammer
          </Link>
        </div>
      </div>
    </div>
  );
}
